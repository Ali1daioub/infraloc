"""
Universal schedule file parser using MPXJ (via jpype).
Supports: XER, PMXML, MPP, MSPDI, PP, SDEF, MPX
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schedule import (
    Activity, Dependency, Calendar, WBSNode,
    ActivityType, ActivityStatus, DependencyType, LagType
)


def _map_activity_type(task_type_str: str | None) -> ActivityType:
    if not task_type_str:
        return ActivityType.CPM
    t = str(task_type_str).upper()
    if "MILE" in t:
        return ActivityType.MILESTONE
    if "LOE" in t or "LEVEL" in t:
        return ActivityType.LOE
    if "WBS" in t or "SUMM" in t:
        return ActivityType.SUMMARY
    return ActivityType.CPM


def _map_dep_type(dep_type_str: str | None) -> DependencyType:
    if not dep_type_str:
        return DependencyType.FS
    t = str(dep_type_str).upper()
    if "FF" in t:
        return DependencyType.FF
    if "SS" in t:
        return DependencyType.SS
    if "SF" in t:
        return DependencyType.SF
    return DependencyType.FS


def _java_date_to_python(java_date) -> datetime | None:
    if java_date is None:
        return None
    try:
        from java.util import Date
        if isinstance(java_date, Date):
            millis = java_date.getTime()
            return datetime.fromtimestamp(millis / 1000.0, tz=timezone.utc)
    except Exception:
        pass
    try:
        # Try LocalDateTime or other types
        return datetime.fromisoformat(str(java_date)).replace(tzinfo=timezone.utc)
    except Exception:
        return None


def _duration_to_hours(duration) -> float | None:
    if duration is None:
        return None
    try:
        # MPXJ Duration object
        hours = duration.getDuration()
        time_unit = str(duration.getUnits())
        if "HOUR" in time_unit:
            return float(hours)
        if "DAY" in time_unit:
            return float(hours) * 8.0
        if "WEEK" in time_unit:
            return float(hours) * 40.0
        if "MONTH" in time_unit:
            return float(hours) * 160.0
        if "MINUTE" in time_unit:
            return float(hours) / 60.0
        return float(hours)
    except Exception:
        return None


async def parse_schedule_file(
    file_path: str, extension: str, project_id: uuid.UUID, db: AsyncSession
) -> dict:
    """Parse a schedule file using MPXJ and import into the database."""
    import jpype
    if not jpype.isJVMStarted():
        jpype.startJVM(classpath=["backend/lib/*"])

    from net.sf.mpxj.reader import UniversalProjectReader

    reader = UniversalProjectReader()
    project_file = reader.read(file_path)

    if project_file is None:
        raise ValueError(f"Could not parse file: {file_path}")

    # Track imported counts
    counts = {"activities": 0, "dependencies": 0, "calendars": 0, "wbs_nodes": 0}

    # Map source IDs to our UUIDs for dependency linking
    source_to_uuid: dict[str, uuid.UUID] = {}

    # Import calendars
    for cal in project_file.getCalendars():
        cal_name = str(cal.getName()) if cal.getName() else "Default"
        db_cal = Calendar(
            project_id=project_id,
            name=cal_name,
        )
        db.add(db_cal)
        counts["calendars"] += 1

    # Import WBS
    wbs_map: dict[str, uuid.UUID] = {}
    for task in project_file.getTasks():
        if task.getSummary():
            wbs_id = uuid.uuid4()
            source_id = str(task.getUniqueID()) if task.getUniqueID() else str(task.getID())
            wbs_node = WBSNode(
                id=wbs_id,
                project_id=project_id,
                code=str(task.getWBS() or source_id),
                name=str(task.getName() or "Unnamed"),
            )
            db.add(wbs_node)
            wbs_map[source_id] = wbs_id
            counts["wbs_nodes"] += 1

    # Import activities
    for task in project_file.getTasks():
        if task.getSummary() and not task.getMilestone():
            continue  # Skip pure summary tasks (already in WBS)
        if task.getNull():
            continue

        source_id = str(task.getUniqueID()) if task.getUniqueID() else str(task.getID())
        activity_id = uuid.uuid4()
        source_to_uuid[source_id] = activity_id

        # Determine WBS parent
        wbs_id = None
        parent = task.getParentTask()
        if parent:
            parent_source_id = str(parent.getUniqueID()) if parent.getUniqueID() else str(parent.getID())
            wbs_id = wbs_map.get(parent_source_id)

        activity = Activity(
            id=activity_id,
            project_id=project_id,
            activity_code=str(task.getWBS() or task.getID() or source_id),
            name=str(task.getName() or "Unnamed"),
            activity_type=_map_activity_type(str(task.getType()) if task.getType() else None),
            wbs_id=wbs_id,
            planned_start=_java_date_to_python(task.getStart()),
            planned_finish=_java_date_to_python(task.getFinish()),
            actual_start=_java_date_to_python(task.getActualStart()),
            actual_finish=_java_date_to_python(task.getActualFinish()),
            early_start=_java_date_to_python(task.getEarlyStart()),
            early_finish=_java_date_to_python(task.getEarlyFinish()),
            late_start=_java_date_to_python(task.getLateStart()),
            late_finish=_java_date_to_python(task.getLateFinish()),
            duration_hours=_duration_to_hours(task.getDuration()),
            remaining_duration_hours=_duration_to_hours(task.getRemainingDuration()),
            total_float_hours=_duration_to_hours(task.getTotalSlack()),
            percent_complete=float(task.getPercentageComplete() or 0),
            source_id=source_id,
            source_format=extension.lstrip("."),
        )
        db.add(activity)
        counts["activities"] += 1

    # Import dependencies
    for task in project_file.getTasks():
        if task.getNull():
            continue
        source_id = str(task.getUniqueID()) if task.getUniqueID() else str(task.getID())
        successor_uuid = source_to_uuid.get(source_id)
        if not successor_uuid:
            continue

        predecessors = task.getPredecessors()
        if predecessors:
            for rel in predecessors:
                pred_task = rel.getTargetTask()
                if pred_task is None:
                    continue
                pred_source_id = str(pred_task.getUniqueID()) if pred_task.getUniqueID() else str(pred_task.getID())
                pred_uuid = source_to_uuid.get(pred_source_id)
                if not pred_uuid:
                    continue

                lag_hours = _duration_to_hours(rel.getLag()) or 0.0

                dep = Dependency(
                    predecessor_id=pred_uuid,
                    successor_id=successor_uuid,
                    dependency_type=_map_dep_type(str(rel.getType()) if rel.getType() else None),
                    lag_hours=lag_hours,
                    lag_type=LagType.TIME,
                )
                db.add(dep)
                counts["dependencies"] += 1

    await db.flush()
    return counts
