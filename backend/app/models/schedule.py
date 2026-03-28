import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, DateTime, ForeignKey, Text, Float, Integer,
    Enum as SAEnum, JSON, Boolean, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base
import enum


# --- Enums ---

class ActivityType(str, enum.Enum):
    LINEAR = "linear"          # Line on time-distance diagram (has chainage + rate)
    BLOCK = "block"            # Stationary work at fixed location
    MILESTONE = "milestone"    # Point event
    CPM = "cpm"               # Standard CPM activity (no linear data)
    LOE = "loe"               # Level of effort
    SUMMARY = "summary"       # Summary/hammock


class ActivityStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class DependencyType(str, enum.Enum):
    FS = "FS"  # Finish-to-Start
    FF = "FF"  # Finish-to-Finish
    SS = "SS"  # Start-to-Start
    SF = "SF"  # Start-to-Finish


class LagType(str, enum.Enum):
    TIME = "time"        # Lag in hours/days
    DISTANCE = "distance"  # Lag in distance units


class WorkDirection(str, enum.Enum):
    INCREASING = "increasing"  # Low chainage to high
    DECREASING = "decreasing"  # High chainage to low


# --- Models ---

class Calendar(Base):
    __tablename__ = "calendars"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    # Working days: {"mon": true, "tue": true, ..., "sun": false}
    working_days: Mapped[dict] = mapped_column(JSONB, default=lambda: {
        "mon": True, "tue": True, "wed": True, "thu": True, "fri": True, "sat": False, "sun": False
    })
    hours_per_day: Mapped[float] = mapped_column(Float, default=8.0)

    project: Mapped["Project"] = relationship(back_populates="calendars", foreign_keys=[project_id])
    exceptions: Mapped[list["CalendarException"]] = relationship(back_populates="calendar", cascade="all, delete-orphan")


class CalendarException(Base):
    __tablename__ = "calendar_exceptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    calendar_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_working: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    calendar: Mapped["Calendar"] = relationship(back_populates="exceptions")


class WBSNode(Base):
    __tablename__ = "wbs_nodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("wbs_nodes.id"), nullable=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    project: Mapped["Project"] = relationship(back_populates="wbs_nodes")
    parent: Mapped["WBSNode | None"] = relationship(remote_side="WBSNode.id")
    activities: Mapped[list["Activity"]] = relationship(back_populates="wbs_node")


class LBSNode(Base):
    """Location Breakdown Structure — parallel to WBS but for spatial organization."""
    __tablename__ = "lbs_nodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lbs_nodes.id"), nullable=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    start_chainage: Mapped[float] = mapped_column(Float, nullable=False)
    end_chainage: Mapped[float] = mapped_column(Float, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    project: Mapped["Project"] = relationship(back_populates="lbs_nodes")
    parent: Mapped["LBSNode | None"] = relationship(remote_side="LBSNode.id")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    wbs_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("wbs_nodes.id"), nullable=True)
    calendar_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=True)

    # Identity
    activity_code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    activity_type: Mapped[ActivityType] = mapped_column(SAEnum(ActivityType), default=ActivityType.CPM)
    status: Mapped[ActivityStatus] = mapped_column(SAEnum(ActivityStatus), default=ActivityStatus.NOT_STARTED)

    # CPM fields (standard scheduling)
    planned_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_finish: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_finish: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    early_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    early_finish: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    late_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    late_finish: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    remaining_duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_float_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    free_float_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    percent_complete: Mapped[float] = mapped_column(Float, default=0.0)

    # Linear fields (time-distance specific)
    start_chainage: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_chainage: Mapped[float | None] = mapped_column(Float, nullable=True)
    direction: Mapped[WorkDirection | None] = mapped_column(SAEnum(WorkDirection), nullable=True)
    production_rate: Mapped[float | None] = mapped_column(Float, nullable=True)  # units/day
    production_rate_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)  # m/day, km/day

    # Display
    color: Mapped[str] = mapped_column(String(20), default="#3B82F6")
    line_width: Mapped[int] = mapped_column(Integer, default=2)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # Import tracking
    source_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_format: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Custom fields
    custom_fields: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project: Mapped["Project"] = relationship(back_populates="activities")
    wbs_node: Mapped["WBSNode | None"] = relationship(back_populates="activities")

    predecessors: Mapped[list["Dependency"]] = relationship(
        foreign_keys="Dependency.successor_id", back_populates="successor", cascade="all, delete-orphan"
    )
    successors: Mapped[list["Dependency"]] = relationship(
        foreign_keys="Dependency.predecessor_id", back_populates="predecessor", cascade="all, delete-orphan"
    )
    segments: Mapped[list["ActivitySegment"]] = relationship(back_populates="activity", cascade="all, delete-orphan")


class ActivitySegment(Base):
    """Supports non-uniform production rates (varying slope along an activity)."""
    __tablename__ = "activity_segments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id"), nullable=False)
    start_chainage: Mapped[float] = mapped_column(Float, nullable=False)
    end_chainage: Mapped[float] = mapped_column(Float, nullable=False)
    production_rate: Mapped[float] = mapped_column(Float, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    activity: Mapped["Activity"] = relationship(back_populates="segments")


class Dependency(Base):
    __tablename__ = "dependencies"
    __table_args__ = (
        UniqueConstraint("predecessor_id", "successor_id", name="uq_dependency"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    predecessor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id"), nullable=False)
    successor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id"), nullable=False)
    dependency_type: Mapped[DependencyType] = mapped_column(SAEnum(DependencyType), default=DependencyType.FS)
    lag_hours: Mapped[float] = mapped_column(Float, default=0.0)
    lag_type: Mapped[LagType] = mapped_column(SAEnum(LagType), default=LagType.TIME)
    lag_distance: Mapped[float | None] = mapped_column(Float, nullable=True)

    predecessor: Mapped["Activity"] = relationship(foreign_keys=[predecessor_id], back_populates="successors")
    successor: Mapped["Activity"] = relationship(foreign_keys=[successor_id], back_populates="predecessors")


class Baseline(Base):
    __tablename__ = "baselines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)  # Compressed snapshot of all activity dates

    project: Mapped["Project"] = relationship(back_populates="baselines")


