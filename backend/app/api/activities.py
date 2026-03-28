from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.schedule import Activity, Dependency
from app.schemas.schedule import (
    ActivityCreate, ActivityUpdate, ActivityResponse,
    DependencyCreate, DependencyResponse,
)

router = APIRouter(prefix="/projects/{project_id}", tags=["activities"])


@router.get("/activities", response_model=list[ActivityResponse])
async def list_activities(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity)
        .where(Activity.project_id == project_id)
        .order_by(Activity.sort_order)
    )
    return result.scalars().all()


@router.post("/activities", response_model=ActivityResponse)
async def create_activity(
    project_id: UUID,
    data: ActivityCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    activity = Activity(project_id=project_id, **data.model_dump())
    db.add(activity)
    await db.flush()
    await db.refresh(activity)
    return activity


@router.patch("/activities/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    project_id: UUID,
    activity_id: UUID,
    data: ActivityUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == activity_id, Activity.project_id == project_id)
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    await db.flush()
    await db.refresh(activity)
    return activity


@router.delete("/activities/{activity_id}")
async def delete_activity(
    project_id: UUID,
    activity_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == activity_id, Activity.project_id == project_id)
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    await db.delete(activity)
    return {"status": "deleted"}


# --- Dependencies ---

@router.get("/dependencies", response_model=list[DependencyResponse])
async def list_dependencies(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dependency)
        .join(Activity, Dependency.predecessor_id == Activity.id)
        .where(Activity.project_id == project_id)
    )
    return result.scalars().all()


@router.post("/dependencies", response_model=DependencyResponse)
async def create_dependency(
    project_id: UUID,
    data: DependencyCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dep = Dependency(**data.model_dump())
    db.add(dep)
    await db.flush()
    await db.refresh(dep)
    return dep
