"""Auth + Person Card (CRM) backend tests for Community of Kindness — Iteration 2.

Covers:
  - POST /api/auth/login (admin, volunteer, wrong password)
  - GET  /api/auth/me   (with/without token)
  - POST /api/cards     (consent gate: stability, notes, public-card)
  - GET  /api/cards     (list)
  - GET  /api/cards/{id}
  - PATCH /api/cards/{id}  (public + private layer, RBAC on private)
  - POST /api/cards/{id}/revoke
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
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


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(
        f"{API}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def volunteer_token(session):
    r = session.post(
        f"{API}/auth/login",
        json={"email": VOL_EMAIL, "password": VOL_PASSWORD},
        timeout=15,
    )
    if r.status_code != 200:
        pytest.skip(f"Volunteer login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def _full_consent(layer_2_consent=True):
    return {
        "stability_confirmed": True,
        "notes_consent": True,
        "public_card_consent": layer_2_consent,
    }


# ---------- Auth ----------
class TestAuthLogin:
    def test_admin_login_success(self, session):
        r = session.post(
            f"{API}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str) and len(data["access_token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert data["user"]["name"]
        assert "id" in data["user"]

    def test_volunteer_login_success(self, session):
        r = session.post(
            f"{API}/auth/login",
            json={"email": VOL_EMAIL, "password": VOL_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["role"] == "volunteer"
        assert data["user"]["email"] == VOL_EMAIL

    def test_login_wrong_password_401(self, session):
        r = session.post(
            f"{API}/auth/login",
            json={"email": ADMIN_EMAIL, "password": "WRONGPW"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_login_unknown_email_401(self, session):
        r = session.post(
            f"{API}/auth/login",
            json={"email": f"nope_{uuid.uuid4().hex[:6]}@x.co", "password": "x"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_login_email_case_insensitive(self, session):
        r = session.post(
            f"{API}/auth/login",
            json={"email": ADMIN_EMAIL.upper(), "password": ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200


class TestAuthMe:
    def test_me_with_token(self, session, admin_token):
        r = session.get(f"{API}/auth/me", headers=_auth(admin_token), timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_me_without_token_401(self, session):
        # Use bare requests to avoid session headers leaking
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_invalid_token_401(self, session):
        r = session.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer not.a.real.token"},
            timeout=15,
        )
        assert r.status_code == 401


# ---------- Person Card consent gate ----------
class TestCardConsentGate:
    def test_create_card_without_auth_401(self, session):
        r = requests.post(
            f"{API}/cards",
            json={
                "alias": "TEST_NoAuth",
                "layer": 1,
                "consent": _full_consent(),
            },
            timeout=15,
        )
        assert r.status_code == 401

    def test_create_card_stability_false_returns_400(self, session, admin_token):
        payload = {
            "alias": "TEST_NoStability",
            "layer": 1,
            "consent": {
                "stability_confirmed": False,
                "notes_consent": True,
                "public_card_consent": False,
            },
        }
        r = session.post(f"{API}/cards", json=payload, headers=_auth(admin_token), timeout=15)
        assert r.status_code == 400, r.text
        assert "stability" in r.json()["detail"].lower()

    def test_create_card_notes_consent_false_returns_400(self, session, admin_token):
        payload = {
            "alias": "TEST_NoNotes",
            "layer": 1,
            "consent": {
                "stability_confirmed": True,
                "notes_consent": False,
                "public_card_consent": False,
            },
        }
        r = session.post(f"{API}/cards", json=payload, headers=_auth(admin_token), timeout=15)
        assert r.status_code == 400, r.text
        assert "notes" in r.json()["detail"].lower() or "consent" in r.json()["detail"].lower()

    def test_create_card_layer2_requires_public_consent_returns_400(self, session, admin_token):
        payload = {
            "alias": "TEST_Layer2NoPublic",
            "layer": 2,
            "consent": {
                "stability_confirmed": True,
                "notes_consent": True,
                "public_card_consent": False,
            },
        }
        r = session.post(f"{API}/cards", json=payload, headers=_auth(admin_token), timeout=15)
        assert r.status_code == 400, r.text
        assert "public" in r.json()["detail"].lower()


# ---------- Person Card CRUD ----------
class TestCardCRUD:
    @pytest.fixture(scope="class")
    def created_card(self, session, admin_token):
        alias = f"TEST_Alias_{uuid.uuid4().hex[:6]}"
        payload = {
            "alias": alias,
            "layer": 2,
            "consent": _full_consent(),
            "public": {
                "location_patterns": "near Fishing Boat Harbour mornings",
                "needs": ["Food", "Warm clothing"],
                "skills": ["Storytelling"],
                "pay_forward": "Music",
            },
            "private": {
                "real_name": "Jane Doe",
                "trust_level": "recognised",
                "stability_windows": "weekday mornings",
                "risk_patterns": "",
            },
        }
        r = session.post(f"{API}/cards", json=payload, headers=_auth(admin_token), timeout=15)
        assert r.status_code == 200, r.text
        return r.json()

    def test_create_card_full_consent(self, created_card):
        c = created_card
        assert c["alias"].startswith("TEST_Alias_")
        assert c["layer"] == 2
        assert c["consent"]["stability_confirmed"] is True
        assert c["consent"]["notes_consent"] is True
        assert c["consent"]["public_card_consent"] is True
        assert c["consent"]["revoked_at"] is None
        assert c["public"]["needs"] == ["Food", "Warm clothing"]
        assert c["private"]["trust_level"] == "recognised"
        assert c["private"]["real_name"] == "Jane Doe"
        assert c["created_by"] == ADMIN_EMAIL
        assert "id" in c

    def test_list_cards_includes_created(self, session, admin_token, created_card):
        r = session.get(f"{API}/cards", headers=_auth(admin_token), timeout=15)
        assert r.status_code == 200, r.text
        ids = [c["id"] for c in r.json()]
        assert created_card["id"] in ids

    def test_list_cards_requires_operator(self, session):
        r = requests.get(f"{API}/cards", timeout=15)
        assert r.status_code == 401

    def test_get_card_by_id(self, session, admin_token, created_card):
        r = session.get(f"{API}/cards/{created_card['id']}", headers=_auth(admin_token), timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == created_card["id"]

    def test_get_card_not_found_404(self, session, admin_token):
        r = session.get(f"{API}/cards/does-not-exist", headers=_auth(admin_token), timeout=15)
        assert r.status_code == 404

    def test_patch_public_layer(self, session, admin_token, created_card):
        r = session.patch(
            f"{API}/cards/{created_card['id']}",
            json={
                "public": {
                    "location_patterns": "South Beach evenings",
                    "needs": ["Water"],
                    "skills": [],
                    "pay_forward": None,
                }
            },
            headers=_auth(admin_token),
            timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["public"]["location_patterns"] == "South Beach evenings"
        assert body["public"]["needs"] == ["Water"]

    def test_patch_private_layer_by_admin(self, session, admin_token, created_card):
        r = session.patch(
            f"{API}/cards/{created_card['id']}",
            json={
                "private": {
                    "real_name": "Jane Updated",
                    "trust_level": "anchored",
                    "stability_windows": "afternoons",
                    "risk_patterns": "",
                }
            },
            headers=_auth(admin_token),
            timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["private"]["real_name"] == "Jane Updated"
        assert body["private"]["trust_level"] == "anchored"

    def test_patch_private_layer_by_other_operator_returns_403(
        self, session, admin_token, volunteer_token, created_card
    ):
        # Card created by admin → volunteer attempting to edit private layer should 403
        r = session.patch(
            f"{API}/cards/{created_card['id']}",
            json={
                "private": {
                    "real_name": "Should Not Save",
                    "trust_level": "trace",
                    "stability_windows": None,
                    "risk_patterns": None,
                }
            },
            headers=_auth(volunteer_token),
            timeout=15,
        )
        assert r.status_code == 403, r.text

    def test_patch_public_layer_by_other_operator_allowed(
        self, session, volunteer_token, created_card
    ):
        # Volunteer may still edit public layer of a card they didn't create
        r = session.patch(
            f"{API}/cards/{created_card['id']}",
            json={"public": {"location_patterns": "vol-edit", "needs": [], "skills": [], "pay_forward": None}},
            headers=_auth(volunteer_token),
            timeout=15,
        )
        assert r.status_code == 200, r.text
        assert r.json()["public"]["location_patterns"] == "vol-edit"

    def test_revoke_consent_clears_public_and_drops_layer(
        self, session, admin_token, created_card
    ):
        r = session.post(
            f"{API}/cards/{created_card['id']}/revoke",
            headers=_auth(admin_token),
            timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["layer"] == 0
        assert body["consent"]["revoked_at"] is not None
        assert body["consent"]["notes_consent"] is False
        assert body["consent"]["public_card_consent"] is False
        # Public layer cleared
        assert body["public"]["location_patterns"] is None
        assert body["public"]["needs"] == []
        # Alias retained so operators can recognise on re-engagement
        assert body["alias"].startswith("TEST_Alias_")
