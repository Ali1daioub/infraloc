# TILOS Reference Package for Claude Code

## What's In This Package

```
tilos-reference/
├── README.md                    ← You are here
├── DESIGN_SPEC.md               ← Complete product design specification
├── VISUAL_INDEX.md              ← Index mapping every screenshot to its feature
├── slides-presentation/         ← 29 PNGs from TILOS sales presentation
│   ├── slide_01.png ... slide_29.png
└── slides-guide/                ← 66 PNGs from TILOS Getting Started Guide
    ├── page_01.png ... page_66.png
```

## How to Use with Claude Code

### Step 1: Copy this folder into your project

```bash
# In your project root:
cp -r /path/to/tilos-reference/ docs/tilos-reference/
```

### Step 2: Add to your CLAUDE.md (project instructions)

Add this to your project's `CLAUDE.md` file so Claude Code always knows about it:

```markdown
## Design Reference

This project is a modern web-based alternative to Trimble TILOS 
(time-location planning software for linear construction projects).

- Read `docs/tilos-reference/DESIGN_SPEC.md` for the full product spec
- See `docs/tilos-reference/VISUAL_INDEX.md` to find reference screenshots
- Screenshots are in `docs/tilos-reference/slides-presentation/` and 
  `docs/tilos-reference/slides-guide/`

When building UI components, reference the relevant screenshots to match 
the functional layout while applying modern design (dark mode, clean UI, 
React components).
```

### Step 3: Reference images when prompting Claude Code

```bash
# Example: Building the main time-distance canvas
claude "Build the main time-distance diagram canvas component. 
Reference docs/tilos-reference/slides-presentation/slide_07.png 
for the layout — it shows how time flows vertically (Y axis), 
distance flows horizontally (X axis), and tasks are drawn as 
diagonal lines. Make it modern with dark mode support."

# Example: Building the properties panel  
claude "Create the task properties panel. Look at 
docs/tilos-reference/slides-guide/page_13.png for the tab structure 
(Details, Categories, Display, Coordinates, Calculation, Links). 
Build it as a right slide-out panel with a modern look."

# Example: Building task interaction
claude "Implement task drawing on the canvas. Reference 
docs/tilos-reference/slides-guide/page_43.png — the user clicks 
at a start point (time, distance) and drags to an end point to 
create a task line. Show coordinate feedback while drawing."
```

### Step 4: Use the --image flag for visual reference

Claude Code can directly view PNG images:

```bash
# Show Claude Code what the time-distance diagram looks like
claude --image docs/tilos-reference/slides-presentation/slide_07.png \
  "This is the TILOS time-distance diagram. Build a modern React 
  version of this layout."

# Show the full UI layout
claude --image docs/tilos-reference/slides-guide/page_10.png \
  "This is the TILOS UI layout. Redesign this as a modern web app 
  with a collapsible sidebar, canvas center, and slide-out properties."
```

## Key Design Decisions (Quick Reference)

| Decision | Choice | Why |
|----------|--------|-----|
| Rendering | Canvas (Konva.js) | Performance with 1000+ tasks |
| State | Zustand | Simple, performant, React-native |
| UI Framework | Radix UI + Tailwind | Accessible, customizable, modern |
| Data Format | JSON native, XML export | Developer-friendly, industry-compatible |
| Y-axis direction | Time flows downward | Industry convention (TILOS standard) |
| Storage | IndexedDB local-first | Works offline, no server needed for MVP |

## MVP Priority Features

1. **Time-distance canvas** — draw tasks as lines on time × distance grid
2. **Task properties** — edit dates, distances, quantities, work rate
3. **Scales** — time (month/week/day) and distance with station points
4. **Calendar** — 5-day week with weekend display
5. **Links** — FS/SS/FF with time AND distance lag
6. **Gantt view** — synchronized bar chart of same data
7. **Save/Load** — JSON project files
8. **Export** — PDF print, MS Project XML

## Contact

Package created for Ali Daioub's linear planning product development.
Based on Trimble TILOS 10.2 reference materials.
