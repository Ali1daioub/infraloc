from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    total_length: float | None = None
    start_chainage: float = 0.0
    end_chainage: float | None = None
    chainage_unit: str = "m"


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: ProjectStatus | None = None
    total_length: float | None = None
    start_chainage: float | None = None
    end_chainage: float | None = None
    chainage_unit: str | None = None
    data_date: datetime | None = None


class ProjectResponse(BaseModel):
    id: UUID
    org_id: UUID
    name: str
    description: str | None
    status: ProjectStatus
    total_length: float | None
    start_chainage: float
    end_chainage: float | None
    chainage_unit: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
