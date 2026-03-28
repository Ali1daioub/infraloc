from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.schedule import (
    ActivityType, ActivityStatus, DependencyType,
    LagType, WorkDirection
)


class ActivityCreate(BaseModel):
    activity_code: str
    name: str
    activity_type: ActivityType = ActivityType.CPM
    wbs_id: UUID | None = None
    calendar_id: UUID | None = None
    planned_start: datetime | None = None
    planned_finish: datetime | None = None
    duration_hours: float | None = None
    start_chainage: float | None = None
    end_chainage: float | None = None
    direction: WorkDirection | None = None
    production_rate: float | None = None
    production_rate_unit: str | None = None
    color: str = "#3B82F6"


class ActivityUpdate(BaseModel):
    name: str | None = None
    activity_type: ActivityType | None = None
    status: ActivityStatus | None = None
    planned_start: datetime | None = None
    planned_finish: datetime | None = None
    actual_start: datetime | None = None
    actual_finish: datetime | None = None
    duration_hours: float | None = None
    percent_complete: float | None = None
    start_chainage: float | None = None
    end_chainage: float | None = None
    direction: WorkDirection | None = None
    production_rate: float | None = None
    color: str | None = None
    line_width: int | None = None


class ActivityResponse(BaseModel):
    id: UUID
    project_id: UUID
    activity_code: str
    name: str
    activity_type: ActivityType
    status: ActivityStatus
    planned_start: datetime | None
    planned_finish: datetime | None
    actual_start: datetime | None
    actual_finish: datetime | None
    early_start: datetime | None
    early_finish: datetime | None
    late_start: datetime | None
    late_finish: datetime | None
    duration_hours: float | None
    total_float_hours: float | None
    percent_complete: float
    start_chainage: float | None
    end_chainage: float | None
    direction: WorkDirection | None
    production_rate: float | None
    color: str
    line_width: int
    wbs_id: UUID | None
    source_id: str | None
    source_format: str | None

    model_config = {"from_attributes": True}


class DependencyCreate(BaseModel):
    predecessor_id: UUID
    successor_id: UUID
    dependency_type: DependencyType = DependencyType.FS
    lag_hours: float = 0.0
    lag_type: LagType = LagType.TIME
    lag_distance: float | None = None


class DependencyResponse(BaseModel):
    id: UUID
    predecessor_id: UUID
    successor_id: UUID
    dependency_type: DependencyType
    lag_hours: float
    lag_type: LagType
    lag_distance: float | None

    model_config = {"from_attributes": True}
