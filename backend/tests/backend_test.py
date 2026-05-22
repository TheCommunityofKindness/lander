"""Backend API tests for Community of Kindness."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://freya-walyulup.preview.emergentagent.com"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health(self, session):
        r = session.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        assert data["service"] == "community-of-kindness"

    def test_root(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# ---------- Subscribers ----------
class TestSubscribe:
    def test_subscribe_valid(self, session):
        email = f"test_{uuid.uuid4().hex[:10]}@example.com"
        r = session.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email.lower()
        assert "id" in data and isinstance(data["id"], str)
        assert "created_at" in data

    def test_subscribe_duplicate_returns_409(self, session):
        email = f"dup_{uuid.uuid4().hex[:10]}@example.com"
        r1 = session.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r1.status_code == 200
        r2 = session.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r2.status_code == 409
        assert "already" in r2.json()["detail"].lower()

    def test_subscribe_case_insensitive_duplicate(self, session):
        base = f"case_{uuid.uuid4().hex[:10]}@Example.com"
        r1 = session.post(f"{API}/subscribe", json={"email": base}, timeout=15)
        assert r1.status_code == 200
        r2 = session.post(f"{API}/subscribe", json={"email": base.lower()}, timeout=15)
        assert r2.status_code == 409

    def test_subscribe_invalid_email_returns_422(self, session):
        r = session.post(f"{API}/subscribe", json={"email": "not-an-email"}, timeout=15)
        assert r.status_code == 422

    def test_subscribe_missing_email_returns_422(self, session):
        r = session.post(f"{API}/subscribe", json={}, timeout=15)
        assert r.status_code == 422

    def test_list_subscribers(self, session):
        email = f"list_{uuid.uuid4().hex[:10]}@example.com"
        session.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        r = session.get(f"{API}/subscribers", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        emails = [i["email"] for i in items]
        assert email.lower() in emails


# ---------- Volunteers ----------
class TestVolunteers:
    def test_create_volunteer_valid(self, session):
        email = f"vol_{uuid.uuid4().hex[:10]}@example.com"
        payload = {"name": "TEST Volunteer", "email": email, "note": "happy to help"}
        r = session.post(f"{API}/volunteers", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == "TEST Volunteer"
        assert data["email"] == email.lower()
        assert data["note"] == "happy to help"
        assert "id" in data

    def test_create_volunteer_no_note(self, session):
        email = f"volnn_{uuid.uuid4().hex[:10]}@example.com"
        r = session.post(f"{API}/volunteers", json={"name": "No Note", "email": email}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["note"] is None

    def test_create_volunteer_invalid_email_returns_422(self, session):
        r = session.post(f"{API}/volunteers", json={"name": "Bad", "email": "nope"}, timeout=15)
        assert r.status_code == 422

    def test_create_volunteer_missing_name_returns_422(self, session):
        r = session.post(f"{API}/volunteers", json={"email": "a@b.co"}, timeout=15)
        assert r.status_code == 422

    def test_create_volunteer_empty_name_returns_422(self, session):
        r = session.post(f"{API}/volunteers", json={"name": "", "email": "a@b.co"}, timeout=15)
        assert r.status_code == 422

    def test_list_volunteers(self, session):
        email = f"vlist_{uuid.uuid4().hex[:10]}@example.com"
        session.post(f"{API}/volunteers", json={"name": "List Test", "email": email}, timeout=15)
        r = session.get(f"{API}/volunteers", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        emails = [i["email"] for i in items]
        assert email.lower() in emails
