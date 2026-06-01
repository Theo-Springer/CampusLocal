from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.config import settings
from src.database.db import init_db, SessionLocal
from src.routes import auth, users, posts, events
from src.database.seed import seed_database

# Startup event
def startup_event():
    """Initialize database on startup"""
    init_db()
    # Seed demo data if needed
    db = SessionLocal()
    seed_database(db)
    db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    startup_event()
    yield
    # Shutdown
    pass


# Create FastAPI app
app = FastAPI(
    title="CampusLocal API",
    description="Social network API for campus communities",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(events.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
