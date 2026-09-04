from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import alerts, apps, events, overview, settings, simulations, users, mock_data
from app.database import Base, SessionLocal, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from seed.seed_runner import run_seed
        run_seed(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Silent Shift Security Behavior Center", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(overview.router)
app.include_router(users.router)
app.include_router(events.router)
app.include_router(alerts.router)
app.include_router(simulations.router)
app.include_router(apps.router)
app.include_router(settings.router)
app.include_router(mock_data.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
