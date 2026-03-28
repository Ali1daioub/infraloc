from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
import app.models  # noqa — ensure all models are registered before API loads
from app.api import auth, projects, activities, import_file, schedule

settings = get_settings()

app = FastAPI(
    title="InfraLoc API",
    description="Cloud-native linear scheduling platform",
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(activities.router, prefix="/api/v1")
app.include_router(import_file.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")


@app.get("/api/health")
async def health():
    return {"status": "healthy", "version": settings.APP_VERSION}
