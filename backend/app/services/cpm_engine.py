"""
Critical Path Method (CPM) scheduling engine.
Performs forward pass, backward pass, float calculation, and critical path identification.
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class CPMActivity:
    id: UUID
    name: str
    duration_hours: float
    predecessors: list[tuple[UUID, str, float]] = field(default_factory=list)  # (pred_id, type, lag_hours)
    successors: list[tuple[UUID, str, float]] = field(default_factory=list)
    early_start: float = 0.0
    early_finish: float = 0.0
    late_start: float = float("inf")
    late_finish: float = float("inf")
    total_float: float = 0.0
    free_float: float = 0.0
    is_critical: bool = False
    # Linear fields
    start_chainage: float | None = None
    end_chainage: float | None = None
    production_rate: float | None = None


class CPMEngine:
    def __init__(self):
        self.activities: dict[UUID, CPMActivity] = {}
        self.sorted_ids: list[UUID] = []

    def add_activity(self, activity: CPMActivity):
        self.activities[activity.id] = activity

    def _topological_sort(self) -> list[UUID]:
        """Kahn's algorithm for topological ordering."""
        in_degree: dict[UUID, int] = defaultdict(int)
        adj: dict[UUID, list[UUID]] = defaultdict(list)

        for act_id, act in self.activities.items():
            if act_id not in in_degree:
                in_degree[act_id] = 0
            for pred_id, _, _ in act.predecessors:
                if pred_id in self.activities:
                    adj[pred_id].append(act_id)
                    in_degree[act_id] += 1

        queue = [aid for aid, deg in in_degree.items() if deg == 0]
        result = []

        while queue:
            node = queue.pop(0)
            result.append(node)
            for neighbor in adj[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(result) != len(self.activities):
            # Circular dependency detected — return what we can
            missing = set(self.activities.keys()) - set(result)
            result.extend(missing)

        return result

    def forward_pass(self):
        """Calculate early start and early finish for all activities."""
        self.sorted_ids = self._topological_sort()

        for act_id in self.sorted_ids:
            act = self.activities[act_id]
            max_es = 0.0

            for pred_id, dep_type, lag in act.predecessors:
                if pred_id not in self.activities:
                    continue
                pred = self.activities[pred_id]

                if dep_type == "FS":
                    es = pred.early_finish + lag
                elif dep_type == "SS":
                    es = pred.early_start + lag
                elif dep_type == "FF":
                    es = pred.early_finish + lag - act.duration_hours
                elif dep_type == "SF":
                    es = pred.early_start + lag - act.duration_hours
                else:
                    es = pred.early_finish + lag

                max_es = max(max_es, es)

            act.early_start = max_es
            act.early_finish = max_es + act.duration_hours

    def backward_pass(self):
        """Calculate late start and late finish for all activities."""
        # Find project end (max early finish)
        project_end = max(act.early_finish for act in self.activities.values()) if self.activities else 0.0

        # Initialize all late finishes to project end
        for act in self.activities.values():
            act.late_finish = project_end
            act.late_start = project_end - act.duration_hours

        # Backward pass in reverse topological order
        for act_id in reversed(self.sorted_ids):
            act = self.activities[act_id]

            for succ_id, dep_type, lag in act.successors:
                if succ_id not in self.activities:
                    continue
                succ = self.activities[succ_id]

                if dep_type == "FS":
                    lf = succ.late_start - lag
                elif dep_type == "SS":
                    lf = succ.late_start - lag + act.duration_hours
                elif dep_type == "FF":
                    lf = succ.late_finish - lag
                elif dep_type == "SF":
                    lf = succ.late_finish - lag + act.duration_hours
                else:
                    lf = succ.late_start - lag

                act.late_finish = min(act.late_finish, lf)

            act.late_start = act.late_finish - act.duration_hours

    def calculate_float(self):
        """Calculate total and free float for all activities."""
        for act_id in self.sorted_ids:
            act = self.activities[act_id]
            act.total_float = act.late_start - act.early_start

            # Free float = min(successor ES) - this EF
            if act.successors:
                min_succ_es = float("inf")
                for succ_id, dep_type, lag in act.successors:
                    if succ_id not in self.activities:
                        continue
                    succ = self.activities[succ_id]
                    if dep_type == "FS":
                        min_succ_es = min(min_succ_es, succ.early_start - lag)
                    else:
                        min_succ_es = min(min_succ_es, succ.early_start)
                act.free_float = max(0.0, min_succ_es - act.early_finish)
            else:
                project_end = max(a.early_finish for a in self.activities.values())
                act.free_float = max(0.0, project_end - act.early_finish)

            # Critical if total float is zero (or near zero for floating point)
            act.is_critical = abs(act.total_float) < 0.001

    def calculate(self) -> dict[UUID, CPMActivity]:
        """Run full CPM calculation."""
        if not self.activities:
            return {}

        self.forward_pass()
        self.backward_pass()
        self.calculate_float()
        return self.activities

    def get_critical_path(self) -> list[UUID]:
        """Return activity IDs on the critical path in order."""
        return [aid for aid in self.sorted_ids if self.activities[aid].is_critical]


def hours_to_datetime(base_date: datetime, hours: float, hours_per_day: float = 8.0) -> datetime:
    """Convert hour offset to actual datetime considering working hours."""
    working_days = hours / hours_per_day
    calendar_days = int(working_days * 7 / 5)  # Approximate
    remaining_hours = hours % hours_per_day
    return base_date + timedelta(days=calendar_days, hours=remaining_hours)
