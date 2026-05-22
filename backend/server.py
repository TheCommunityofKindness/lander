from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Community of Kindness API")
api_router = APIRouter(prefix="/api")


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


class Volunteer(BaseModel):
    id: str
    name: str
    email: EmailStr
    note: Optional[str] = None
    created_at: datetime


# ---------- Routes ----------
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
    return Subscriber(
        id=doc["id"],
        email=doc["email"],
        created_at=datetime.fromisoformat(doc["created_at"]),
    )


@api_router.get("/subscribers", response_model=List[Subscriber])
async def list_subscribers():
    subs = await db.subscribers.find({}, {"_id": 0}).to_list(1000)
    out = []
    for s in subs:
        ts = s["created_at"]
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        out.append(Subscriber(id=s["id"], email=s["email"], created_at=ts))
    return out


@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(payload: VolunteerIn):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "note": payload.note.strip() if payload.note else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.volunteers.insert_one(doc.copy())
    return Volunteer(
        id=doc["id"],
        name=doc["name"],
        email=doc["email"],
        note=doc["note"],
        created_at=datetime.fromisoformat(doc["created_at"]),
    )


@api_router.get("/volunteers", response_model=List[Volunteer])
async def list_volunteers():
    vols = await db.volunteers.find({}, {"_id": 0}).to_list(1000)
    out = []
    for v in vols:
        ts = v["created_at"]
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        out.append(
            Volunteer(
                id=v["id"],
                name=v["name"],
                email=v["email"],
                note=v.get("note"),
                created_at=ts,
            )
        )
    return out


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
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
