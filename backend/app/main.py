import logging
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError

from app import job_seeker, company, interview
from app.public import router as public_router
from app.lib.errors import CustomException

from app.config import settings

from .database import engine, Base

from app.routes import admin as admin_router
from app.models import AdminUser
from app.lib.security import hash_password

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)  # or DEBUG in dev

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduDiagnoAI API",
    description="API for EduDiagnoAI, an AI-powered interview platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Authorization"],
    max_age=3600,
)


os.makedirs("uploads", exist_ok=True)
app.mount("/api/v1/uploads", StaticFiles(directory="uploads"), name="uploads")


from app.exception_handlers import (
    sqlalchemy_exception_handler,
    custom_exception_handler,
    global_exception_handler,
)

app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(CustomException, custom_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)


app.include_router(public_router.router, prefix="/api/v1", tags=["Public"])
app.include_router(company.router.router, prefix="/api/v1/company", tags=["Company"])
app.include_router(interview.router.router, prefix="/api/v1/interview", tags=["Interview"])
app.include_router(job_seeker.router.router, prefix="/api/v1/jobseeker", tags=["Job Seeker"])
app.include_router(admin_router.router, prefix="/api/v1/admin", tags=["Admin"])


@app.get("/api/v1", tags=["Health"])
def read_root():
    return {"status": "healthy", "version": "1.0.0"}


@app.on_event("startup")
def create_default_admin():
    from sqlalchemy.orm import Session
    from .database import SessionLocal
    db: Session = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.email == "admin@edudiagno.com").first()
        if not admin:
            admin = AdminUser(
                email="admin@edudiagno.com",
                password_hash=hash_password("EdUdIaGnO364"),
                is_active=True,
                role="superadmin"
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
