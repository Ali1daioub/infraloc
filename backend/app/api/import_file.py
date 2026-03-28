import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.import_engine.parser import parse_schedule_file

router = APIRouter(prefix="/projects/{project_id}/import", tags=["import"])


@router.post("/")
async def import_schedule_file(
    project_id: UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate file extension
    allowed_extensions = {".xer", ".xml", ".mpp", ".pp", ".mpx", ".sdef", ".xlsx", ".csv"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported: {', '.join(sorted(allowed_extensions))}"
        )

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = await parse_schedule_file(tmp_path, ext, project_id, db)
        return {
            "status": "success",
            "filename": file.filename,
            "format": ext,
            "activities_imported": result["activities"],
            "dependencies_imported": result["dependencies"],
            "calendars_imported": result["calendars"],
            "wbs_nodes_imported": result["wbs_nodes"],
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Import failed: {str(e)}")
    finally:
        os.unlink(tmp_path)
