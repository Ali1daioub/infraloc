export type ActivityType = "linear" | "block" | "milestone" | "cpm" | "loe" | "summary";
export type ActivityStatus = "not_started" | "in_progress" | "completed";
export type DependencyType = "FS" | "FF" | "SS" | "SF";
export type WorkDirection = "increasing" | "decreasing";

export interface Activity {
  id: string;
  project_id: string;
  activity_code: string;
  name: string;
  activity_type: ActivityType;
  status: ActivityStatus;
  planned_start: string | null;
  planned_finish: string | null;
  actual_start: string | null;
  actual_finish: string | null;
  early_start: string | null;
  early_finish: string | null;
  late_start: string | null;
  late_finish: string | null;
  duration_hours: number | null;
  total_float_hours: number | null;
  percent_complete: number;
  start_chainage: number | null;
  end_chainage: number | null;
  direction: WorkDirection | null;
  production_rate: number | null;
  color: string;
  line_width: number;
  wbs_id: string | null;
  source_id: string | null;
  source_format: string | null;
}

export interface Dependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  dependency_type: DependencyType;
  lag_hours: number;
  lag_distance: number | null;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: "active" | "archived" | "template";
  total_length: number | null;
  start_chainage: number;
  end_chainage: number | null;
  chainage_unit: string;
  created_at: string;
  updated_at: string;
}

export interface DiagramViewport {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}
