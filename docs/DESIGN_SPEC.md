# Linear Project Planner — Design Specification
## A Modern Web-Based Alternative to Trimble TILOS

> **Purpose**: This document serves as the complete design reference for building a modern, web-based time-location planning tool inspired by TILOS. Feed this document + the reference screenshots to Claude Code so it can design and build the product.

---

## 1. PRODUCT OVERVIEW

### What is TILOS?
TILOS (Time-Location Planning Software) is a desktop Windows application by Trimble for scheduling **linear construction projects** — projects that progress along a physical distance axis (roads, railways, tunnels, pipelines, power lines). Unlike Gantt-only tools (MS Project, Primavera P6), TILOS uses a **time-distance diagram** where:
- **Y-axis** = Time (calendar dates flowing downward)
- **X-axis** = Distance/Location (project chainage in meters/km)
- **Tasks** = Diagonal lines showing work progressing over time AND space

### Why Build a Modern Alternative?
TILOS is a legacy Windows-only desktop app with a dated UI. A modern web-based version would:
- Run anywhere (browser, tablet, mobile)
- Have a modern, dark-mode-capable UI
- Support real-time collaboration
- Integrate with modern APIs and cloud services
- Be significantly more intuitive for new users

### Target Users
- Infrastructure project planners & schedulers
- Construction project managers
- Civil engineering firms
- Railway/highway/pipeline operators
- Claims consultants

---

## 2. CORE CONCEPTS (from TILOS)

### 2.1 Time-Distance Diagram (THE core feature)
The central innovation. A 2D chart where:
- Tasks are drawn as **lines/shapes** on a time × distance grid
- The **slope** of a task line = work speed (steeper = slower, flatter = faster)
- The **direction** (left-to-right or right-to-left) = work direction along the route
- **Overlapping** task lines at the same distance = potential conflicts visible at a glance

**Reference screenshots**: `slides-presentation/slide_07.png`, `slides-presentation/slide_08.png`

### 2.2 Cell System (Integrated Views)
TILOS uses a grid of **cells** arranged in rows and columns. Each cell can be a different type:
- **Time-Distance Cell**: The main planning canvas (tasks drawn here)
- **Time Cell**: Displays time scales (month, week, day) — typically left column
- **Distance Cell**: Displays distance scales and site graphics — typically top rows
- **Gantt Chart Cell**: Traditional bar chart view of the same data
- **Dashboard Cell**: Resource/cost summaries

Cells are linked via **master-dependent** relationships — zooming/scrolling the main time-distance cell synchronizes the scale cells.

**Reference screenshots**: `slides-guide/page_13.png`, `slides-guide/page_16.png`

### 2.3 Tasks
Tasks are the fundamental data objects:
- **Normal tasks**: Lines drawn on the time-distance diagram
- **Summary tasks**: Group multiple sub-tasks (expand/collapse)
- **Hammock tasks**: Monitor other tasks (span from first to last)
- **Milestones**: Point events at specific time/distance

Task properties include:
- Name, ID, Calendar assignment
- Start/End dates, Start/End distances
- Duration (working days)
- Quantity, Work rate, Unit (for automatic duration calculation)
- Resource allocations, Cost allocations
- Display: line color, width, pattern, shape fill

**Reference screenshots**: `slides-guide/page_38.png` through `slides-guide/page_44.png`

### 2.4 Links & Constraints
Tasks can be linked with dependencies:
- **Finish to Start (FS)**: Default — successor starts when predecessor finishes
- **Start to Start (SS)**: Tasks start together (with optional lag)
- **Finish to Finish (FF)**: Tasks end together
- **Start to Finish (SF)**: Rare

**Unique TILOS feature**: Lag can be defined in **distance** (e.g., "start 400m behind predecessor"), not just time.

**Reference screenshots**: `slides-guide/page_51.png` through `slides-guide/page_55.png`

### 2.5 Distance Profiles & Station Points
Named locations along the project route:
- Crossings (roads, railways)
- Bridges, tunnels, rivers
- Project start/end points
- Any significant chainage point

These appear as vertical grid lines on the distance axis, helping users position tasks accurately.

**Reference screenshots**: `slides-guide/page_29.png`, `slides-guide/page_30.png`

### 2.6 Calendars
Define working/non-working time:
- 5-day week (8h/day) — default
- 7-day continuous (24h) — tunneling
- Custom periods (winter schedule, Ramadan, etc.)
- Exceptions (holidays, weather shutdowns)

Calendar colors appear as horizontal bands on the time axis.

**Reference screenshots**: `slides-guide/page_59.png` through `slides-guide/page_61.png`

### 2.7 Resources & Cost Planning
- Resource library (machines, labor, materials)
- Allocation to tasks (quantity per hour, number of units)
- Resource histograms (bar charts showing usage over time)
- Cost centers, cost/income tracking per task
- S-curves for cumulative cost visualization

**Reference screenshots**: `slides-presentation/slide_10.png`, `slides-presentation/slide_11.png`

### 2.8 Mass Haulage
Specific to earthworks projects:
- Cut and fill volumes along the route
- Mass haul diagram showing material movement
- Integration with Trimble Business Center data

**Reference screenshots**: `slides-presentation/slide_12.png`, `slides-presentation/slide_25.png`

### 2.9 Progress Tracking
- Baseline vs. actual comparison
- Progress entry (% complete, actual dates)
- Forecast projection from report date
- Micro-progress (detailed progress within a task)

**Reference screenshot**: `slides-presentation/slide_20.png`

### 2.10 BIM Integration
- Import distance profiles from 3D models (XML)
- Link to Trimble Connect for quantity extraction
- IFC model component linking to TILOS activities

**Reference screenshots**: `slides-presentation/slide_18.png`, `slides-presentation/slide_19.png`

---

## 3. UI/UX DESIGN DIRECTION

### 3.1 Modern Design Principles
The new product should NOT look like TILOS. It should feel like a modern SaaS tool:

**Visual Style**:
- Clean, minimal UI with generous whitespace
- Dark mode as default (construction workers in site offices, evening planners)
- Light mode option
- Accent color: Electric blue (#0066FF) or similar
- Font: Inter or similar modern sans-serif
- No Windows-95-era toolbars or icon strips

**Layout**:
- Left sidebar: Project explorer / navigation (collapsible)
- Top bar: Breadcrumb + global actions (save, share, export, settings)
- Center: Main canvas (time-distance diagram or Gantt)
- Right panel: Properties panel (slides in/out when object selected)
- Bottom: Optional status bar with coordinates

**Interactions**:
- Canvas: pan (click-drag on background), zoom (scroll wheel or pinch)
- Tasks: click to select, drag to move, drag handles to resize
- Links: drag from task end-point to another task
- Context menus: right-click for actions
- Command palette: Cmd+K for quick actions
- Keyboard shortcuts for power users

### 3.2 Key Screens

#### A. Dashboard / Project Home
- Project cards with thumbnail previews
- Recent projects, templates
- Quick-create button

#### B. Main Planning View (Time-Distance Diagram)
The hero screen. Must include:
- **Canvas**: The time-distance grid with tasks rendered as styled lines/shapes
- **Time scale bar**: Left side — showing months/weeks/days (zoomable)
- **Distance scale bar**: Top — showing chainage with station point labels
- **Site graphic strip**: Optional row above distance scale showing a route map/sketch
- **Minimap**: Small overview in corner for navigation
- **Floating toolbar**: Drawing tools (add task, add shape, add text)
- **Properties panel**: Right side, shows selected task details

#### C. Gantt Chart View
Traditional schedule view — same data, bar chart format:
- Text columns: Name, ID, Start, End, Duration, Resources
- Bar chart: Timeline bars with dependencies
- Synchronized with time-distance view

#### D. Task List View
Spreadsheet-like table of all tasks:
- Sortable, filterable columns
- Inline editing
- Bulk operations

#### E. Resource View
- Resource histogram (stacked bar chart by time period)
- Resource table with allocations

#### F. Settings / Project Config
- Calendars editor
- Distance profiles editor  
- Category/WBS editor
- Import/Export options

### 3.3 Component Reference from TILOS Screenshots

| TILOS Component | Modern Equivalent | Reference Image |
|---|---|---|
| TILOS Explorer (tree) | Collapsible left sidebar with sections | `slides-guide/page_11.png` |
| Preset Toolbar (top) | Contextual toolbar that changes based on selection | `slides-guide/page_12.png` |
| Insert Object Toolbar (left) | Floating action toolbar or bottom toolbar | `slides-guide/page_12.png` |
| Object Properties (bottom) | Right slide-out panel with tabs | `slides-guide/page_13.png` |
| Cell system | Flexible panel layout (resizable, like VS Code) | `slides-guide/page_15.png` |
| Time-distance cell with tasks | Main SVG/Canvas rendering area | `slides-presentation/slide_07.png` |
| Time scales | Fixed left scale panel | `slides-guide/page_26.png` |
| Distance scales | Fixed top scale panel | `slides-guide/page_27.png` |
| Distance graphic (site map) | Embedded image strip synced to distance axis | `slides-guide/page_33.png` |
| Calendar display (weekend bands) | Semi-transparent overlay strips | `slides-guide/page_19.png` |
| Task annotations | Tooltip-style labels following task angle | `slides-guide/page_57.png` |
| Gantt chart | Modern Gantt component | `slides-guide/page_56.png` |
| Link arrows | Curved or angled dependency lines | `slides-guide/page_51.png` |
| Mass haulage diagram | Area chart with cut/fill visualization | `slides-presentation/slide_12.png` |
| Resource histograms | Stacked bar chart | `slides-presentation/slide_10.png` |
| Construction phases | Colored overlay zones | `slides-presentation/slide_13.png`, `slide_14.png` |
| CO2 footprint view | Dashboard cards with charts | `slides-presentation/slide_21.png` |
| Progress tracking | Baseline vs actual overlay | `slides-presentation/slide_20.png` |

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Recommended Stack
```
Frontend:
  - React 18+ or Next.js 14+
  - Canvas rendering: Konva.js or Pixi.js (for the time-distance diagram)
  - OR: SVG-based rendering for simpler initial implementation
  - State management: Zustand or Jotai
  - UI components: Radix UI + Tailwind CSS
  - Charts: Recharts or Visx (for histograms, S-curves)
  - Date handling: date-fns or Temporal API

Backend:
  - Node.js / Express or Fastify
  - Database: PostgreSQL with JSONB for flexible task data
  - OR: SQLite for single-user/local-first
  - File format: Custom JSON schema (export to XML for P6/MSP compat)
  - Auth: Clerk or NextAuth

Deployment:
  - Vercel or self-hosted Docker
  - Real-time: WebSocket or Liveblocks for collaboration
```

### 4.2 Data Model (Core Entities)

```typescript
interface Project {
  id: string;
  name: string;
  distanceUnit: 'm' | 'km' | 'ft' | 'mi';
  startDistance: number;
  endDistance: number;
  startDate: Date;
  endDate: Date;
  defaultCalendarId: string;
  subProjects: SubProject[];
}

interface SubProject {
  id: string;
  name: string;
  projectId: string;
  tasks: Task[];
}

interface Task {
  id: string;
  taskId: string; // user-facing ID like "A-00010"
  name: string;
  type: 'normal' | 'summary' | 'hammock' | 'milestone';
  subProjectId: string;
  parentTaskId?: string; // for summary task hierarchy
  
  // Coordinates
  startDate: Date;
  endDate: Date;
  startDistance: number;
  endDistance: number;
  
  // Calculation
  quantity: number;
  quantityUnit: string;
  workRate: number;
  workRateUnit: string;
  duration: number; // working days
  
  // Display
  lineColor: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  fillColor?: string;
  fillPattern?: string;
  
  // Metadata
  calendarId: string;
  layerId: string;
  templateId?: string;
  wbs?: string;
  
  // Resources & Costs
  allocations: ResourceAllocation[];
  
  // Progress
  percentComplete: number;
  actualStartDate?: Date;
  actualEndDate?: Date;
}

interface Link {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lagTime: number; // in working days
  lagDistance: number; // in distance units (unique feature!)
  lagType: 'time' | 'distance';
  category: string;
  driving: boolean;
}

interface DistanceProfile {
  id: string;
  name: string;
  points: StationPoint[];
}

interface StationPoint {
  distance: number;
  name: string;
  type: 'border' | 'crossing' | 'creek' | 'bridge' | 'tunnel' | string;
}

interface Calendar {
  id: string;
  name: string;
  weekDefinition: DayDefinition[];
  exceptions: CalendarException[];
}

interface DayDefinition {
  dayOfWeek: number; // 0-6
  name: string;
  workingHours: TimeRange[];
  type: 'working' | 'weekend' | 'holiday';
  color: string;
}

interface View {
  id: string;
  name: string;
  type: 'integrated' | 'gantt' | 'tasklist' | 'resource' | 'linklist';
  cells: CellConfig[];
  layout: CellLayout; // row/column arrangement
}

interface CellConfig {
  id: string;
  position: [number, number]; // [col, row]
  type: 'time-distance' | 'time' | 'distance' | 'gantt' | 'graphic' | 'dashboard';
  masterCellId?: string;
  subProjectIds: string[];
  timeScales: TimeScaleConfig[];
  distanceScales: DistanceScaleConfig[];
  displaySettings: CellDisplaySettings;
}
```

### 4.3 Rendering Architecture

The time-distance diagram renderer must handle:

1. **Coordinate system**: Map (date, distance) → (x, y) screen pixels
2. **Zoom levels**: From full-project overview to single-day detail
3. **Task rendering**: Draw lines/shapes with correct slope based on work speed
4. **Calendar overlay**: Draw non-working time bands
5. **Grid lines**: Time grid (horizontal) + distance grid (vertical)
6. **Labels**: Task annotations following line angle
7. **Links**: Dependency arrows between tasks
8. **Hit testing**: Click detection on tasks, links, grid
9. **Scrolling**: Synchronized across linked cells
10. **Performance**: Handle 1000+ tasks smoothly

**Recommended approach**: 
- Use HTML Canvas (via Konva.js) for the main diagram — better performance for many objects
- Use SVG for overlays (selection handles, tooltips)
- Use DOM for UI panels, toolbars, property editors

---

## 5. MVP FEATURE ROADMAP

### Phase 1: Core Planning Canvas
- [ ] Project setup (name, dates, distances)
- [ ] Time-distance diagram rendering
- [ ] Draw/edit/delete tasks as lines
- [ ] Time scales (month, week, day)
- [ ] Distance scale with station points
- [ ] Basic calendar (5-day week)
- [ ] Zoom and pan
- [ ] Task properties panel
- [ ] Save/load project (JSON)

### Phase 2: Scheduling Engine
- [ ] Task linking (FS, SS, FF, SF)
- [ ] Lag by time AND distance
- [ ] Reschedule (forward pass CPM)
- [ ] Summary tasks
- [ ] Hammock tasks
- [ ] Gantt chart view (synchronized)

### Phase 3: Resources & Costs
- [ ] Resource library
- [ ] Resource allocation to tasks
- [ ] Resource histogram
- [ ] Cost centers
- [ ] Cost/income per task
- [ ] S-curve display

### Phase 4: Progress & Reporting
- [ ] Baseline save/compare
- [ ] Progress entry
- [ ] Report date line
- [ ] Forecast projection
- [ ] Print/PDF export
- [ ] MS Project XML export/import

### Phase 5: Advanced Features
- [ ] Mass haulage diagram
- [ ] Construction phase planning
- [ ] Distance profile import (XML/CSV)
- [ ] Site graphic overlay
- [ ] CO2 footprint tracking
- [ ] Multi-user collaboration
- [ ] BIM integration (IFC)

---

## 6. CLAUDE CODE INSTRUCTIONS

### How to Use This Reference Package

When working in Claude Code, structure your project like this:

```
my-linear-planner/
├── docs/
│   ├── DESIGN_SPEC.md          ← This file
│   ├── reference-screenshots/
│   │   ├── slides-presentation/ ← 29 TILOS presentation PNGs
│   │   └── slides-guide/        ← 66 TILOS guide PNGs
│   └── VISUAL_INDEX.md          ← Index of what each screenshot shows
├── src/
│   ├── components/
│   ├── core/                    ← Planning engine (scheduling, CPM)
│   ├── canvas/                  ← Time-distance renderer
│   ├── store/                   ← State management
│   └── types/                   ← TypeScript interfaces
├── package.json
└── ...
```

### Key Commands for Claude Code

```bash
# When starting a new component, reference the design spec:
# "Read docs/DESIGN_SPEC.md section 3.2 and look at 
#  docs/reference-screenshots/slides-presentation/slide_07.png
#  to design the main planning canvas"

# When implementing task rendering:
# "Look at slides-guide/page_41.png through page_44.png for 
#  how tasks are drawn and labeled on the time-distance diagram"

# When building the properties panel:
# "Reference slides-guide/page_13.png and page_19.png for 
#  the object properties layout with tabs"
```

### Critical Design Decisions

1. **Canvas vs SVG**: Start with SVG for simplicity, migrate to Canvas if performance issues arise at 500+ tasks
2. **Local-first**: Store projects in browser IndexedDB initially, add cloud sync later
3. **File format**: Use JSON as native format, XML for import/export compatibility
4. **Units**: Always store in base units (meters, hours), convert for display
5. **Coordinate system**: Y-axis inverted (time flows downward, matching TILOS convention and construction industry standard)

---

## 7. VISUAL INDEX

See `VISUAL_INDEX.md` for a complete mapping of every screenshot to the feature it documents.

---

*Document version: 1.0*
*Created: March 2026*
*Based on: TILOS 10.2 presentation by M.Sc. Ali Daioub and TILOS Getting Started Guide*
