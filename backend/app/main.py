import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth as auth_router
from .routers import qr as qr_router

load_dotenv()

# The tables only need creating once; on every later boot this is a no-op.
# Don't let a transient database outage (e.g. Railway's free DB pausing on
# idle) crash-loop the whole API — log it and start anyway so /health and
# clear error responses still work, and requests recover once the DB is back
# (the engine has pool_pre_ping enabled).
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as exc:  # noqa: BLE001
    print(f"[startup] could not reach the database: {exc}")

app = FastAPI(title="Vedikshaya API")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(qr_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}
