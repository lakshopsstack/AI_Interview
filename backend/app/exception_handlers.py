from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.lib.errors import CustomException
from app.main import logger

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"SQLAlchemy at {request.url.path}: {exc}")
    if "unique constraint" in exc.args[0]:
        column_name = exc.args[0].split("Key")[-1].split("=")[0].strip().strip("()")
        return JSONResponse(
            status_code=400,
            content={"detail": f"{column_name} already exists"},
        )
    elif "No row was found" in exc.args[0]:
        return JSONResponse(
            status_code=400,
            content={"detail": "Resource not found"},
        )
    elif "violates foreign key constraint" in exc.args[0]:
        table_name = exc.args[0].split("table")[-1].split('"')[1]
        return JSONResponse(
            status_code=400,
            content={"detail": f"{table_name} does not exist"},
        )

    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected database error."},
    )

async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(status_code=exc.code, content={"detail": exc.args[0]})

async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Something went wrong."})
