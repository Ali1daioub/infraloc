# InfraLoc — Cloud-Native Linear Scheduling Platform

## What Is This?
Modern web-based alternative to Trimble TILOS (time-location planning software for linear construction projects like roads, railways, tunnels, pipelines).

## Design Reference
- Full product spec: `docs/DESIGN_SPEC.md`
- Visual index of all reference screenshots: `docs/VISUAL_INDEX.md`
- Screenshots: `docs/tilos-reference/slides-presentation/` and `docs/tilos-reference/slides-guide/`
- Key screenshots: slide_07.png (core diagram), slide_28.png (dual view), page_41.png (tasks), page_10.png (UI layout)

## Architecture
- **Frontend**: Next.js 16 + Konva.js (canvas) + D3.js (scales) + Zustand (state) + Tailwind CSS
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL 16 + Redis
- **Import**: MPXJ (Java via JPype) for P6 XER/PMXML, MSP MPP/MSPDI, Asta PP, SDEF
- **Collab**: Yjs CRDTs (planned)
- **Deploy**: Vercel (frontend) + Docker (backend)

## Project Structure
```
infraloc/
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── core/      # Config, DB, security
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # CPM engine, business logic
│   │   └── import_engine/  # MPXJ file parser
│   └── alembic/       # DB migrations
├── frontend/          # Next.js frontend
│   └── src/
│       ├── app/       # Pages (dashboard, project view)
│       ├── components/diagram/  # Canvas, panels
│       ├── lib/       # API client
│       ├── store/     # Zustand stores
│       └── types/     # TypeScript types
└── docs/              # Design specs + TILOS reference screenshots
```

## Key Design Decisions
- Y-axis = Time (flows downward), X-axis = Distance (chainage) — matches TILOS/industry convention
- Canvas rendering via Konva.js for performance with 1000+ tasks
- Multi-tenant with PostgreSQL RLS (org_id on every table)
- Distance-based lags on dependencies (unique TILOS feature, preserved)
- Dark mode as default target (construction workers in site offices)

## Running Locally
```bash
docker compose up db redis -d
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8001
cd frontend && npm run dev  # http://localhost:3000
```

## Critical Rules
- NEVER touch Ali's trading bots or AXD services
- This project gets its own infrastructure, NOT the Hetzner AXD VPS
- Use Python 3.12 (not 3.14) for the backend venv — binary packages don't support 3.14 yet
