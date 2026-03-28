from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.schedule import Activity, Dependency
from app.services.cpm_engine import CPMEngine, CPMActivity

router = APIRouter(prefix="/projects/{project_id}/schedule", tags=["schedule"])


@router.post("/calculate")
async def calculate_schedule(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run CPM forward/backward pass and update all activity dates."""
    # Load activities with dependencies
    result = await db.execute(
        select(Activity)
        .where(Activity.project_id == project_id)
        .options(selectinload(Activity.predecessors), selectinload(Activity.successors))
    )
    activities = result.scalars().all()

    if not activities:
        raise HTTPException(status_code=404, detail="No activities found")

    # Build CPM model
    engine = CPMEngine()
    for act in activities:
        preds = [(dep.predecessor_id, dep.dependency_type.value, dep.lag_hours) for dep in act.predecessors]
        succs = [(dep.successor_id, dep.dependency_type.value, dep.lag_hours) for dep in act.successors]

        cpm_act = CPMActivity(
            id=act.id,
            name=act.name,
            duration_hours=act.duration_hours or 0.0,
            predecessors=preds,
            successors=succs,
            start_chainage=act.start_chainage,
            end_chainage=act.end_chainage,
            production_rate=act.production_rate,
        )
        engine.add_activity(cpm_act)

    # Calculate
    results = engine.calculate()
    critical_path = engine.get_critical_path()

    # Update activities in DB
    for act in activities:
        cpm_result = results.get(act.id)
        if cpm_result:
            act.early_start = None  # Will be set via hours_to_datetime when data_date is set
            act.total_float_hours = cpm_result.total_float
            act.free_float_hours = cpm_result.free_float

    await db.flush()

    return {
        "status": "calculated",
        "total_activities": len(activities),
        "critical_path_length": len(critical_path),
        "critical_activities": [str(aid) for aid in critical_path],
        "project_duration_hours": max(r.early_finish for r in results.values()) if results else 0,
    }
