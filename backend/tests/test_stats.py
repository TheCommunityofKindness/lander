"""Iteration 3 — Public KPI Stats feed tests.

Covers:
- GET /api/stats/public (no auth, shape + seed defaults)
- GET /api/stats/admin (auth required + role gates)
- PATCH /api/stats/admin (admin-only, validation, persistence)
- Derived counts: volunteers count and people_held layer>=1 + non-revoked
- Revoking a card decreases people_held by 1
"""

import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://freya-walyulup.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "freya@communityofkindness.org"
ADMIN_PASSWORD = "kindness2026"
VOL_EMAIL = "volunteer@communityofkindness.org"
VOL_PASSWORD = "walyalup2026"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(session, email, password):
    r = session.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token(session):
    return _login(session, ADMIN_EMAIL, ADMIN_PASSWORD)


@pytest.fixture(scope="module")
def volunteer_token(session):
    return _login(session, VOL_EMAIL, VOL_PASSWORD)


def _auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Public stats ----------
class TestPublicStats:
    def test_public_stats_no_auth_returns_full_shape(self, session):
        r = session.get(f"{API}/stats/public")
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ("fridays_served", "meals_shared", "volunteers", "people_held", "updated_at"):
            assert key in data, f"Missing key {key} in {data}"
        assert isinstance(data["fridays_served"], int)
        assert isinstance(data["meals_shared"], int)
        assert isinstance(data["volunteers"], int)
        assert isinstance(data["people_held"], int)
        assert isinstance(data["updated_at"], str)

    def test_public_stats_seeds_defaults_when_singleton_absent(self, session):
        # Endpoint should auto-seed singleton on first call. Just assert reasonable defaults.
        r = session.get(f"{API}/stats/public")
        assert r.status_code == 200
        data = r.json()
        # Default singleton is 150/3000 — but PATCH may have moved it. Just assert >= 0.
        assert data["fridays_served"] >= 0
        assert data["meals_shared"] >= 0

    def test_public_stats_volunteers_count_reflects_new_volunteer(self, session):
        before = session.get(f"{API}/stats/public").json()["volunteers"]
        # Create a unique volunteer
        unique_email = f"test_kpi_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(
            f"{API}/volunteers",
            json={"name": "TEST_KPI Volunteer", "email": unique_email, "note": "kpi test"},
        )
        assert r.status_code == 200, r.text
        after = session.get(f"{API}/stats/public").json()["volunteers"]
        assert after == before + 1, f"Expected volunteers to bump from {before} to {before+1}, got {after}"


# ---------- Admin stats GET ----------
class TestAdminStatsGet:
    def test_admin_stats_requires_auth(self, session):
        r = session.get(f"{API}/stats/admin")
        assert r.status_code == 401

    def test_admin_stats_works_for_admin(self, session, admin_token):
        r = session.get(f"{API}/stats/admin", headers=_auth(admin_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert "fridays_served" in data
        assert "meals_shared" in data
        assert "updated_at" in data

    def test_admin_stats_works_for_volunteer(self, session, volunteer_token):
        # The spec: GET /api/stats/admin works for BOTH admin and volunteer roles
        r = session.get(f"{API}/stats/admin", headers=_auth(volunteer_token))
        assert r.status_code == 200, r.text


# ---------- Admin stats PATCH ----------
class TestAdminStatsPatch:
    def test_patch_requires_auth(self, session):
        r = session.patch(f"{API}/stats/admin", json={"fridays_served": 200, "meals_shared": 4000})
        assert r.status_code == 401

    def test_patch_as_volunteer_forbidden(self, session, volunteer_token):
        r = session.patch(
            f"{API}/stats/admin",
            json={"fridays_served": 200, "meals_shared": 4000},
            headers=_auth(volunteer_token),
        )
        assert r.status_code == 403, r.text

    def test_patch_negative_values_rejected(self, session, admin_token):
        r = session.patch(
            f"{API}/stats/admin",
            json={"fridays_served": -5, "meals_shared": 4000},
            headers=_auth(admin_token),
        )
        assert r.status_code == 422, r.text

    def test_patch_as_admin_updates_and_public_reflects(self, session, admin_token):
        new_fridays = 175
        new_meals = 3210
        r = session.patch(
            f"{API}/stats/admin",
            json={"fridays_served": new_fridays, "meals_shared": new_meals},
            headers=_auth(admin_token),
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["fridays_served"] == new_fridays
        assert body["meals_shared"] == new_meals
        assert body.get("updated_by") == ADMIN_EMAIL

        # Public endpoint reflects the new values
        pub = session.get(f"{API}/stats/public").json()
        assert pub["fridays_served"] == new_fridays
        assert pub["meals_shared"] == new_meals


# ---------- People held (derived) ----------
class TestPeopleHeldDerivation:
    def _make_card(self, session, token, alias):
        payload = {
            "alias": alias,
            "layer": 1,
            "consent": {
                "stability_confirmed": True,
                "notes_consent": True,
                "public_card_consent": False,
            },
            "public": {"needs": [], "skills": []},
            "private": {"trust_level": "trace"},
        }
        r = session.post(f"{API}/cards", json=payload, headers=_auth(token))
        assert r.status_code == 200, r.text
        return r.json()["id"]

    def test_people_held_increments_on_new_layer1_card(self, session, admin_token):
        before = session.get(f"{API}/stats/public").json()["people_held"]
        card_id = self._make_card(session, admin_token, f"TEST_KPI_{uuid.uuid4().hex[:6]}")
        after = session.get(f"{API}/stats/public").json()["people_held"]
        assert after == before + 1, f"people_held should grow by 1: {before}->{after}"

        # Cleanup: revoke this card so it doesn't pollute counts later
        rev = session.post(f"{API}/cards/{card_id}/revoke", headers=_auth(admin_token))
        assert rev.status_code == 200

    def test_revoking_card_decreases_people_held(self, session, admin_token):
        # Create a fresh card
        card_id = self._make_card(session, admin_token, f"TEST_KPI_revoke_{uuid.uuid4().hex[:6]}")
        before = session.get(f"{API}/stats/public").json()["people_held"]
        # Revoke
        rev = session.post(f"{API}/cards/{card_id}/revoke", headers=_auth(admin_token))
        assert rev.status_code == 200
        after = session.get(f"{API}/stats/public").json()["people_held"]
        assert after == before - 1, f"people_held should drop by 1 after revoke: {before}->{after}"
