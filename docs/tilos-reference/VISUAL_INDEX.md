# Visual Index — Reference Screenshot Guide

> Use this index to find the right reference screenshot when building specific features.
> Point Claude Code to the relevant images using: `--image docs/reference-screenshots/[path]`

---

## PRESENTATION SLIDES (slides-presentation/)

| File | Content | Use When Building |
|------|---------|-------------------|
| `slide_01.png` | Title slide — TILOS branding, aerial infrastructure render | Product branding inspiration |
| `slide_02.png` | Agenda + full TILOS interface overview with all panels visible | Overall layout reference — shows time-distance diagram, elevation profile, cut/fill chart, resource table, cost columns, and Gantt-like resource view all in one integrated view |
| `slide_03.png` | Trimble Connected Construction ecosystem diagram | Understanding TILOS position — shows Quantm, Novapoint, Quadri, Connected Site, Vision Link, Business Center integration |
| `slide_04.png` | Key application areas — Pipeline, Railway, Roads, Tunnel, Civil engineering, Transmission grids | Target market reference — photos of each project type |
| `slide_05.png` | European infrastructure projects map — major TILOS users | Customer reference — DB Netz, ÖBB, SNCF, Network Rail, Banedanmark, AlpTransit, BBT |
| `slide_06.png` | Old vs New planning — 40-page Primavera schedule vs single TILOS page | Value proposition visual — key selling point of time-location planning |
| `slide_07.png` | **KEY REFERENCE** — Full TILOS interface annotated: time-distance diagram with elevation, cut/fill profiles, station points, resource columns, cost columns. Shows "where and when" concept | Main canvas design — THE reference for the core time-distance view layout |
| `slide_08.png` | Customizable project views — shows cell arrangement with diagrams along path axis and time axis, crossings cell, free cell arrangement, fade-in/out capabilities | Cell system design — how different data panels relate to each other |
| `slide_09.png` | Task scheduling interface — TILOS Explorer tree, task template library (Earth works categories), calculation panel with quantity/work rate/duration, drawing tasks with mouse | Task creation UI — library panel, calculation inputs, "drawing" interaction model |
| `slide_10.png` | **KEY REFERENCE** — Resource calculation view: resource tree (Labor, Machines, Materials), resource histograms by week, allocation table with operation models, effort, costs | Resource management UI — histogram visualization, allocation table structure |
| `slide_11.png` | **KEY REFERENCE** — Cost and Income Planning: cost center tree (Income, Labour, Machines, Material, Others), periodic cost bars, to-date S-curves, cost columns | Cost tracking UI — S-curve visualization, cost column layout |
| `slide_12.png` | **KEY REFERENCE** — Mass haulage integration: elevation profile, cut/fill mass diagram, transport routes labeled (Cut C1→F1, Fill C4→F3, etc.), resource allocation table per week | Mass haulage feature — area diagram with cut/fill zones and transport arrows |
| `slide_13.png` | Construction phase planning with traffic management: elevation, site map, two construction phases showing traffic routing (old road vs new road), winter time overlay | Phase planning — multi-phase overlay visualization with traffic management |
| `slide_14.png` | Railway phase planning: 4 construction phases showing track status (black=stock, red=in construction, green=in use, yellow=temporary), "Bauablauf Phase" scheduling | Railway-specific phase planning — status color coding system |
| `slide_15.png` | Integration diagram: Office Planning ↔ Field Operations workflow — Business Center, Tekla Civil, TILOS, P6/MS Project, VisionLink, Trimble Field Equipment | Integration architecture reference |
| `slide_16.png` | Quadri DCM hub diagram — connects Railway, Road, Bridge, Tunnel, Landscape, Construction, Geosuite, Site Tool modules | BIM ecosystem reference |
| `slide_17.png` | Quadri 3D presentation — Novapoint 3D model of terrain with road infrastructure | 3D model integration reference |
| `slide_18.png` | **KEY REFERENCE** — BIM data import: Import Wizard for distance profiles from 3D model, profile table (Distance, LandElev, RoadElev, SoilCut, Fill), calculation panel using profile data for quantities | Data import UI — profile import wizard, profile-driven calculation |
| `slide_19.png` | BIM Integration with Trimble Connect: 3D IFC model organizer, component geometry values (Volume, Area), linking components to TILOS activities | BIM linking interface |
| `slide_20.png` | **KEY REFERENCE** — Progress reporting: baseline activities (grey), actual progress (green markers), forecast arrow from report date, comparison visualization | Progress tracking UI — baseline vs actual overlay rendering |
| `slide_21.png` | CO2 footprint scheduling: diesel consumption tracking, CO2 calculations per earthworks and roadworks phases, material logistics transport distances | Sustainability dashboard |
| `slide_22.png` | High voltage line project: TILOS Explorer tree, elevation profile, tower positions, activity scheduling per sector/chainage, satellite map overlay with route sections | Transmission line project type — non-road linear project |
| `slide_23.png` | Offshore wind farm cable laying: time axis by weeks, location axis by turbine positions (J6-M2), installation sequences (anode, TP, JKT, WTG, cable layer) with grout curing periods | Offshore project type — grid-based location axis |
| `slide_24.png` | PPP highway logistics planning: logistic considerations (old bridge usage, new road timing, crusher placement, disposal sites, work direction), physical whiteboard planning photo | Logistics planning features |
| `slide_25.png` | Trimble Business Center corridor mass haulage: mass haul diagram with transport routes, elevation profile, detailed volume calculation table by chainage and soil type | Mass haulage data integration |
| `slide_26.png` | Brenner Base Tunnel project: 220km drilling, 17M m³ material, multi-year timeline, TBM diagram, time-based quantity and site-based costs | Tunnel project type — mega-project reference |
| `slide_27.png` | **KEY REFERENCE** — Tunnel drilling: soil classification zones (K5.4A, K5.2, K6.1, K4.2, K4.1), varying drill speeds by zone (8,200-32,843 m/day), north/south tunnels, connectors, lining, equipment activities | Variable work speed visualization — slope changes based on conditions |
| `slide_28.png` | Project shown as Time-Location AND Gantt Chart: left=time-distance diagram with construction phases, right=Gantt chart with location/type grouping, traffic light annotations | Dual view layout — time-distance + Gantt side by side |
| `slide_29.png` | Thank you / contact slide | N/A |

---

## GETTING STARTED GUIDE (slides-guide/)

| File | Content | Use When Building |
|------|---------|-------------------|
| `page_01.png` | Guide cover page | N/A |
| `page_02.png`-`page_03.png` | Table of contents | Feature checklist reference |
| `page_04.png` | "Make a quick start" intro + final result preview showing completed time-distance diagram with all components | Target output — what a completed plan looks like |
| `page_05.png` | Prerequisites + finished plan closeup showing tasks (topsoil stripping, soil removal, trench opening, pipe laying) with annotations | Task rendering reference — line styles, annotations, distance scale |
| `page_06.png` | New project dialog + template selection (General.hst) | Project creation UI |
| `page_07.png` | Understanding file types (.hst, .hsp, .hsb) + project templates content | File format decisions |
| `page_08.png` | Settings for New Project dialog — distance unit, start/end distance, start/end date, base time unit, calendar selection | Project settings form design |
| `page_09.png` | Project Options categories (Task, Progress, Cost, Distance, Display, Functions, Snapping, Tokens) | Settings panel organization |
| `page_10.png` | **KEY REFERENCE** — Full UI layout annotated: TILOS Explorer, Menu/Toolbar, Preset Toolbar, Working Area, Object Properties pane, Insert Object Toolbar | Complete UI layout reference |
| `page_11.png` | TILOS Explorer tree structure — Views, Project Data, Library sections with all sub-nodes | Navigation sidebar structure |
| `page_12.png` | Menu bar + Insert Object Toolbar + Preset Toolbar details | Toolbar component design |
| `page_13.png` | **KEY REFERENCE** — Window/View/Cell nesting diagram + Object Properties pane with tabs (Details, Categories, Display, Coordinates, Calculation, Links, Floats, Allocations, Progress) | Properties panel tab structure |
| `page_14.png` | New view creation — empty Integrated View with cell borders visible | Empty canvas state |
| `page_15.png` | Cell creation — adding rows/columns, Add Row toolbar button | Cell system manipulation |
| `page_16.png` | **KEY REFERENCE** — Cell numbering system (0,0 / 1,1 / 2,1 / 1,2 / 2,2), Display Page Width/Height buttons, Cell Settings panel | Cell coordinate system |
| `page_17.png` | Time-Distance cell configuration — Cell Wizard, sub-project selection dialog | Cell type configuration |
| `page_18.png` | Adjust View Range dialog — project range options, time/distance axis settings | View range controls |
| `page_19.png` | **KEY REFERENCE** — Configured view with time-distance cell showing calendar bands, Cell Settings tab with axis/distance/date fields, calendar display options (Per Day vs Exactly) | Calendar rendering in cells |
| `page_20.png` | Day Definition Display dialog — collapse weekend, background/line color settings per day type | Calendar customization UI |
| `page_21.png` | Cell type reference — all cell types listed with descriptions | Cell type selection |
| `page_22.png` | Distance cell setup — master cell selection, cell content wizard | Cell linking |
| `page_23.png` | Time cell creation + time scale wizard | Scale creation |
| `page_24.png` | **KEY REFERENCE** — Timescale Line Properties dialog: name, label with F8 tokens, interval/unit/zero-point, text display (placement, alignment, rotation, font), presentation (line size, color, background) | Scale configuration form |
| `page_25.png` | Token selection tree — Time units, Time profile tokens (Name, Description, Work Rate %, Values 1-9) | Token system |
| `page_26.png` | **KEY REFERENCE** — Completed time scales: Month/Week/Day columns with proper formatting | Time scale rendering |
| `page_27.png` | Distance scale configuration — Kilometers (interval 1000m) + Meters in km (interval 100m) labels | Distance scale rendering |
| `page_28.png` | Scale troubleshooting — dots display when cell too narrow | Scale responsiveness |
| `page_29.png` | Distance Profile Properties dialog — station points table (Distance, Name, Type) with import capability | Station points data editor |
| `page_30.png` | **KEY REFERENCE** — Distance Scale Line Properties for station points: irregular scale using distance profile, "Display only profile values" option, profile token {Name} | Station point scale configuration |
| `page_31.png` | **KEY REFERENCE** — Completed distance scales with station point labels (Start, Crossing, Start Fill, Crossing, River, Start Cut, End) + View Map showing cell relationships with arrows | Complete scale system + cell relationship diagram |
| `page_32.png` | Graphic insertion — Insert Graphic Object, figure scaling (Horizontal), Preset Toolbar settings | Image insertion UI |
| `page_33.png` | **KEY REFERENCE** — Road map graphic positioned in distance cell with scaling options, Position tab with Keep proportions, adjust position by distance coordinates | Site map overlay — positioning and synchronization |
| `page_34.png` | Adjust Figure Position dialog — X coordinates mapped to station distances + synchronized result | Image-to-scale alignment |
| `page_35.png` | Grid overlay on graphic cell — Distance Grid display checkbox, layer ordering (Top Text Layer) | Grid system + layering |
| `page_36.png` | Layer management — visibility, selectability, stack order, synchronize layers dialog | Layer management UI |
| `page_37.png` | Distance Grid Line Properties — label with {Name} token, distance profile selection, color by sector | Grid line customization |
| `page_38.png` | **KEY REFERENCE** — Insert Tasks section: calendar display rules, snapping settings, naming, layer assignment, display tab for line presentation | Task creation settings |
| `page_39.png` | Repetitive entry mode — Lock Insert Tool, drag-and-drop task types, Insert key in Gantt, Task List interaction | Batch task creation |
| `page_40.png` | Task data table — 9 tasks with templates, dates (D/M/Y and M/D/Y), distance ranges | Task data specification |
| `page_41.png` | **KEY REFERENCE** — Completed plan with all 9 tasks numbered, showing slopes, crossings, annotations | Full task rendering reference |
| `page_42.png` | Task ID generation — Set Task ID dialog (start value, skip, prefix, number format, suffix) + Task template selection on Preset Toolbar | Task ID system |
| `page_43.png` | **KEY REFERENCE** — Drawing a task: cursor at start point (distance 2700, May 20), drawing right-to-left to end point, coordinates visible in status bar | Task drawing interaction |
| `page_44.png` | Calculation tab — Duration mode, Quantity (19,200 m²), Work rate (120 m²/h), Duration (20 d(8h)), Planned work rate | Task calculation form |
| `page_45.png` | Hammock task setup — Categories & Structure tab, "Keep own Distance Coordinates", Tasks in Hammock table, Calculation with Work rate mode | Hammock task configuration |
| `page_46.png` | Summary and Hammock task types explained | Task type documentation |
| `page_47.png` | Task 4 insertion — Station points dropdown in Coordinates tab (Start, Crossing, Start Fill, etc.), calculation values | Station point coordinate selection |
| `page_48.png` | Summary task (Culvert) with 3 sub-tasks (Riverbed, Walls, Deck), parent task assignment via Categories tab | Summary task hierarchy |
| `page_49.png` | Insert Task Group dialog — task group selection, distance/time coordinates, method selection | Group insertion feature |
| `page_50.png` | Copy Tasks To New Location dialog — sub-project, method, start/end coordinates, destination date, selected tasks table | Task copying feature |
| `page_51.png` | **KEY REFERENCE** — Link creation: drag from task finish arrow to successor start, link types diagram (Start link vs Finish link) | Link creation interaction |
| `page_52.png` | **KEY REFERENCE** — All 9 links shown on diagram with numbered arrows | Complete linking reference |
| `page_53.png` | Drag-and-drop link creation — visual of dragging link arrow between tasks | Link drawing UX |
| `page_54.png` | Link properties — Link tab (Predecessor, Successor, Link type, Lag, Calculate lag by: Working time / Distance to successor), Distance lag field | Link configuration form |
| `page_55.png` | Link methods reference — Links & Constraints tab, link categories, reschedule algorithm notes | Advanced linking features |
| `page_56.png` | **KEY REFERENCE** — Link List view + Gantt Chart view showing same data as bar chart with task bars and dependency arrows | Gantt chart rendering |
| `page_57.png` | **KEY REFERENCE** — Task annotation: Add Task Annotation, Text Field tab with F8 tokens (Date/Start/Schedule), Apply slope of task option | Annotation system |
| `page_58.png` | Token tree for annotations — Task Tokens > Details, Distance, Date (Start/Schedule with format variants dd.mm.yy etc) | Annotation token system |
| `page_59.png` | Calendar editor — Calendar view (year view), day definition assignment, exception handling, Quick assign | Calendar editor UI |
| `page_60.png` | Advanced calendar — Periods tab (week pattern with day definitions), Day Definitions tab (time types: Working/Non-Working from-to ranges) | Calendar period configuration |
| `page_61.png` | Edit time types — Working, Non Working, Overtime, Weekend, Holiday with background/foreground colors and patterns | Time type editor |
| `page_62.png` | Export to MS Project — XML format, export options (links, resources, calendars), field mapping (TILOS tokens ↔ MSP fields) | Export configuration UI |
| `page_63.png` | Print dialog — printer selection, page size, portrait/landscape, scaling options (100%, fit page, select zoom), margins | Print/PDF export UI |
| `page_64.png` | Print scaling options — view size, print on one page, custom zoom, print to N×N pages | Print layout options |
| `page_65.png` | Getting Help — TILOS Community URL, Technical Hotline contact info, Trimble contact details | Support page reference |
| `page_66.png` | Final page — trademark notice | N/A |

---

## QUICK LOOKUP: Which screenshots for which feature?

### Time-Distance Diagram Canvas
→ `slide_07.png`, `slide_08.png`, `slide_27.png`, `page_05.png`, `page_41.png`, `page_43.png`

### Task Drawing & Properties  
→ `slide_09.png`, `page_38.png` through `page_50.png`

### Links & Dependencies
→ `page_51.png` through `page_56.png`

### Time/Distance Scales
→ `page_24.png` through `page_31.png`

### Resource Histograms & Costs
→ `slide_10.png`, `slide_11.png`

### Mass Haulage
→ `slide_12.png`, `slide_25.png`

### Progress Tracking
→ `slide_20.png`

### Calendar System
→ `page_19.png`, `page_20.png`, `page_59.png` through `page_61.png`

### Construction Phases
→ `slide_13.png`, `slide_14.png`

### Full UI Layout
→ `slide_02.png`, `page_10.png`, `page_13.png`

### Gantt Chart
→ `slide_28.png`, `page_56.png`

### Project Types (for marketing/demos)
→ `slide_04.png` (pipelines, railways, roads, tunnels), `slide_22.png` (power lines), `slide_23.png` (offshore wind), `slide_26.png` (mega-tunnel)
