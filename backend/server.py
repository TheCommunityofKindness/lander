from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr


# ---------- Config ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES_HOURS = 12

app = FastAPI(title="Community of Kindness API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRES_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token: Optional[str] = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_operator(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("admin", "volunteer"):
        raise HTTPException(status_code=403, detail="Operator access required")
    return user


# ---------- Models ----------
class SubscribeIn(BaseModel):
    email: EmailStr


class Subscriber(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime


class VolunteerIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    note: Optional[str] = Field(None, max_length=1000)


class VolunteerOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    note: Optional[str] = None
    created_at: datetime


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class LoginOut(BaseModel):
    user: UserOut
    access_token: str


# Person Card models — strict data minimization
TrustLevel = Literal["trace", "threshold", "recognised", "anchored"]
LayerNum = Literal[0, 1, 2, 3]


class ConsentBlock(BaseModel):
    """Consent must be captured at a stability window."""
    stability_confirmed: bool  # Operator confirms participant is clear-headed
    notes_consent: bool  # Participant agrees to minimal notes (Layer 1+)
    public_card_consent: bool  # Participant opts in to Public Person Card (Layer 2)
    granted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    revoked_at: Optional[datetime] = None


class PublicLayer(BaseModel):
    """Editable / revocable by the participant. Operator may edit on their behalf
    only with explicit consent during a stability window."""
    location_patterns: Optional[str] = Field(None, max_length=500)
    needs: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    pay_forward: Optional[str] = Field(None, max_length=500)


class PrivateLayer(BaseModel):
    """Operator-only. Never shown to the participant or other operators outside
    role 'admin' / 'volunteer'."""
    real_name: Optional[str] = Field(None, max_length=200)
    trust_level: TrustLevel = "trace"
    stability_windows: Optional[str] = Field(None, max_length=500)
    risk_patterns: Optional[str] = Field(None, max_length=1000)  # Non-judgmental only


class PersonCardIn(BaseModel):
    alias: str = Field(..., min_length=1, max_length=80)
    layer: LayerNum = 1
    consent: ConsentBlock
    public: PublicLayer = Field(default_factory=PublicLayer)
    private: PrivateLayer = Field(default_factory=PrivateLayer)


class PersonCardUpdate(BaseModel):
    alias: Optional[str] = Field(None, min_length=1, max_length=80)
    layer: Optional[LayerNum] = None
    public: Optional[PublicLayer] = None
    private: Optional[PrivateLayer] = None


class PersonCardOut(BaseModel):
    id: str
    alias: str
    layer: LayerNum
    consent: ConsentBlock
    public: PublicLayer
    private: PrivateLayer
    created_by: str
    created_at: datetime
    updated_at: datetime


# --- Public stats / KPI feed ---
class PublicStats(BaseModel):
    fridays_served: int
    meals_shared: int
    volunteers: int
    people_held: int
    updated_at: datetime


class StatsOverrideIn(BaseModel):
    fridays_served: int = Field(..., ge=0, le=100000)
    meals_shared: int = Field(..., ge=0, le=10000000)


class StatsOverrideOut(BaseModel):
    fridays_served: int
    meals_shared: int
    updated_at: datetime
    updated_by: Optional[str] = None


# ---------- Public Endpoints ----------
@api_router.get("/")
async def root():
    return {"message": "Community of Kindness API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "community-of-kindness"}


@api_router.post("/subscribe", response_model=Subscriber)
async def subscribe(payload: SubscribeIn):
    email = payload.email.lower()
    existing = await db.subscribers.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Email already subscribed")
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.subscribers.insert_one(doc.copy())
    return Subscriber(id=doc["id"], email=doc["email"], created_at=datetime.fromisoformat(doc["created_at"]))


@api_router.post("/volunteers", response_model=VolunteerOut)
async def create_volunteer(payload: VolunteerIn):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "note": (payload.note.strip() if payload.note else None),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if not doc["name"]:
        raise HTTPException(status_code=422, detail="Name cannot be blank")
    await db.volunteers.insert_one(doc.copy())
    return VolunteerOut(
        id=doc["id"],
        name=doc["name"],
        email=doc["email"],
        note=doc["note"],
        created_at=datetime.fromisoformat(doc["created_at"]),
    )


# ---------- Auth Endpoints ----------
@api_router.post("/auth/login", response_model=LoginOut)
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return LoginOut(
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
        access_token=token,
    )


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"])


# ---------- Person Card (CRM) Endpoints ----------
def _card_doc_to_out(doc: dict) -> PersonCardOut:
    consent_raw = doc.get("consent", {}) or {}
    if isinstance(consent_raw.get("granted_at"), str):
        consent_raw["granted_at"] = datetime.fromisoformat(consent_raw["granted_at"])
    if isinstance(consent_raw.get("revoked_at"), str):
        consent_raw["revoked_at"] = datetime.fromisoformat(consent_raw["revoked_at"])
    created_at = doc["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    updated_at = doc["updated_at"]
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return PersonCardOut(
        id=doc["id"],
        alias=doc["alias"],
        layer=doc.get("layer", 1),
        consent=ConsentBlock(**consent_raw),
        public=PublicLayer(**(doc.get("public") or {})),
        private=PrivateLayer(**(doc.get("private") or {})),
        created_by=doc["created_by"],
        created_at=created_at,
        updated_at=updated_at,
    )


@api_router.post("/cards", response_model=PersonCardOut)
async def create_card(payload: PersonCardIn, user: dict = Depends(require_operator)):
    # Consent gate: stability + at least notes_consent required for any Person Card
    if not payload.consent.stability_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Stability window must be confirmed before any card is created.",
        )
    if not payload.consent.notes_consent:
        raise HTTPException(
            status_code=400,
            detail="Minimal-notes consent is required to create a card.",
        )
    if payload.layer >= 2 and not payload.consent.public_card_consent:
        raise HTTPException(
            status_code=400,
            detail="Layer 2 (Aionic Mirror) requires explicit public-card consent.",
        )

    now = datetime.now(timezone.utc)
    consent_dict = payload.consent.model_dump()
    consent_dict["granted_at"] = consent_dict["granted_at"].isoformat()
    if consent_dict.get("revoked_at"):
        consent_dict["revoked_at"] = consent_dict["revoked_at"].isoformat()

    doc = {
        "id": str(uuid.uuid4()),
        "alias": payload.alias.strip(),
        "layer": payload.layer,
        "consent": consent_dict,
        "public": payload.public.model_dump(),
        "private": payload.private.model_dump(),
        "created_by": user["email"],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.person_cards.insert_one(doc.copy())
    return _card_doc_to_out(doc)


@api_router.get("/cards", response_model=List[PersonCardOut])
async def list_cards(user: dict = Depends(require_operator)):
    cards = await db.person_cards.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_card_doc_to_out(c) for c in cards]


@api_router.get("/cards/{card_id}", response_model=PersonCardOut)
async def get_card(card_id: str, user: dict = Depends(require_operator)):
    doc = await db.person_cards.find_one({"id": card_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")
    return _card_doc_to_out(doc)


@api_router.patch("/cards/{card_id}", response_model=PersonCardOut)
async def update_card(
    card_id: str, payload: PersonCardUpdate, user: dict = Depends(require_operator)
):
    doc = await db.person_cards.find_one({"id": card_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")

    update_fields: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if payload.alias is not None:
        update_fields["alias"] = payload.alias.strip()
    if payload.layer is not None:
        update_fields["layer"] = payload.layer
    if payload.public is not None:
        update_fields["public"] = payload.public.model_dump()
    if payload.private is not None:
        # Only admins may modify private layer for cards they didn't create
        if user.get("role") != "admin" and doc.get("created_by") != user["email"]:
            raise HTTPException(
                status_code=403,
                detail="Only the originating operator (or admin) may edit the private layer.",
            )
        update_fields["private"] = payload.private.model_dump()

    await db.person_cards.update_one({"id": card_id}, {"$set": update_fields})
    fresh = await db.person_cards.find_one({"id": card_id}, {"_id": 0})
    return _card_doc_to_out(fresh)


@api_router.post("/cards/{card_id}/revoke", response_model=PersonCardOut)
async def revoke_consent(card_id: str, user: dict = Depends(require_operator)):
    """Participant (via operator) revokes consent.
    Card is preserved minimally — public layer is cleared, layer drops to 0,
    and revoked_at is set. The original alias is retained so operators can
    recognise an existing person if they re-engage."""
    doc = await db.person_cards.find_one({"id": card_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")
    now = datetime.now(timezone.utc).isoformat()
    consent = doc.get("consent", {}) or {}
    consent["revoked_at"] = now
    consent["notes_consent"] = False
    consent["public_card_consent"] = False
    await db.person_cards.update_one(
        {"id": card_id},
        {
            "$set": {
                "consent": consent,
                "layer": 0,
                "public": PublicLayer().model_dump(),
                "updated_at": now,
            }
        },
    )
    fresh = await db.person_cards.find_one({"id": card_id}, {"_id": 0})
    return _card_doc_to_out(fresh)


# ---------- Public Stats / KPI Feed ----------
DEFAULT_FRIDAYS_SERVED = 150
DEFAULT_MEALS_SHARED = 3000


async def _get_overrides() -> dict:
    doc = await db.stats_overrides.find_one({"id": "singleton"}, {"_id": 0})
    if not doc:
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "id": "singleton",
            "fridays_served": DEFAULT_FRIDAYS_SERVED,
            "meals_shared": DEFAULT_MEALS_SHARED,
            "updated_at": now,
            "updated_by": None,
        }
        await db.stats_overrides.insert_one(doc.copy())
    return doc


@api_router.get("/stats/public", response_model=PublicStats)
async def public_stats():
    overrides = await _get_overrides()
    volunteers_count = await db.volunteers.count_documents({})
    # People held = active person cards (layer >= 1, consent not revoked)
    people_held = await db.person_cards.count_documents(
        {"layer": {"$gte": 1}, "consent.revoked_at": None}
    )
    updated_at = overrides["updated_at"]
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return PublicStats(
        fridays_served=int(overrides.get("fridays_served", DEFAULT_FRIDAYS_SERVED)),
        meals_shared=int(overrides.get("meals_shared", DEFAULT_MEALS_SHARED)),
        volunteers=volunteers_count,
        people_held=people_held,
        updated_at=updated_at,
    )


@api_router.get("/stats/admin", response_model=StatsOverrideOut)
async def get_stats_overrides(user: dict = Depends(require_operator)):
    doc = await _get_overrides()
    updated_at = doc["updated_at"]
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return StatsOverrideOut(
        fridays_served=int(doc["fridays_served"]),
        meals_shared=int(doc["meals_shared"]),
        updated_at=updated_at,
        updated_by=doc.get("updated_by"),
    )


@api_router.patch("/stats/admin", response_model=StatsOverrideOut)
async def update_stats_overrides(
    payload: StatsOverrideIn, user: dict = Depends(require_operator)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    now = datetime.now(timezone.utc).isoformat()
    await db.stats_overrides.update_one(
        {"id": "singleton"},
        {
            "$set": {
                "fridays_served": payload.fridays_served,
                "meals_shared": payload.meals_shared,
                "updated_at": now,
                "updated_by": user["email"],
            },
            "$setOnInsert": {"id": "singleton"},
        },
        upsert=True,
    )
    return StatsOverrideOut(
        fridays_served=payload.fridays_served,
        meals_shared=payload.meals_shared,
        updated_at=datetime.fromisoformat(now),
        updated_by=user["email"],
    )


# ---------- App wiring ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


# ---------- Seed users ----------
async def _seed_user(email: str, password: str, name: str, role: str) -> None:
    email_lower = email.lower()
    existing = await db.users.find_one({"email": email_lower})
    if not existing:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": email_lower,
                "password_hash": hash_password(password),
                "name": name,
                "role": role,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info(f"Seeded {role} user: {email_lower}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email_lower},
            {"$set": {"password_hash": hash_password(password), "name": name, "role": role}},
        )
        logger.info(f"Updated {role} user password: {email_lower}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.person_cards.create_index("alias")
    await db.person_cards.create_index("created_at")
    await _seed_user(
        os.environ.get("ADMIN_EMAIL", "admin@example.com"),
        os.environ.get("ADMIN_PASSWORD", "admin"),
        "Freya Cheffers",
        "admin",
    )
    await _seed_user(
        os.environ.get("VOLUNTEER_EMAIL", "volunteer@example.com"),
        os.environ.get("VOLUNTEER_PASSWORD", "volunteer"),
        "Volunteer",
        "volunteer",
    )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
