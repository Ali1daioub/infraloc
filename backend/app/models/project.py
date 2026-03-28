import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text, Float, Integer, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum


class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    TEMPLATE = "template"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(SAEnum(ProjectStatus), default=ProjectStatus.ACTIVE)

    # Linear project properties
    total_length: Mapped[float | None] = mapped_column(Float, nullable=True)  # Total length in meters
    start_chainage: Mapped[float] = mapped_column(Float, default=0.0)
    end_chainage: Mapped[float | None] = mapped_column(Float, nullable=True)
    chainage_unit: Mapped[str] = mapped_column(String(20), default="m")  # m, km, mi, ft
    distance_direction: Mapped[str] = mapped_column(String(20), default="left_to_right")

    # Scheduling settings
    data_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    calendar_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    organization: Mapped["Organization"] = relationship(back_populates="projects")
    activities: Mapped[list["Activity"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    wbs_nodes: Mapped[list["WBSNode"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    lbs_nodes: Mapped[list["LBSNode"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    calendars: Mapped[list["Calendar"]] = relationship(back_populates="project", foreign_keys="Calendar.project_id")
    baselines: Mapped[list["Baseline"]] = relationship(back_populates="project", cascade="all, delete-orphan")


