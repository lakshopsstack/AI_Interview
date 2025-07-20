from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session

from app import schemas
from app.models import InterviewQuestion


def create_interview_question(
    question_data: schemas.CreateInterviewQuestion, db: Session
):
    stmt = (
        insert(InterviewQuestion)
        .values(question_data.model_dump())
        .returning(
            InterviewQuestion.id,
            InterviewQuestion.job_id,
            InterviewQuestion.order_number,
            InterviewQuestion.question,
            InterviewQuestion.question_type,
        )
    )
    result = db.execute(stmt)
    db.commit()
    return result.mappings().one()


def get_interview_question_by_job_id(job_id: int, db: Session):
    stmt = (
        select(
            InterviewQuestion.id,
            InterviewQuestion.question,
            InterviewQuestion.question_type,
            InterviewQuestion.order_number,
            InterviewQuestion.job_id,
        )
        .where(InterviewQuestion.job_id == job_id)
        .order_by(InterviewQuestion.order_number)
    )

    return db.execute(stmt).mappings().all()


def update_interview_question(
    question_data: schemas.UpdateInterviewQuestion, db: Session
):
    stmt = (
        update(InterviewQuestion)
        .where(InterviewQuestion.id == question_data.id)
        .values(question_data.model_dump(exclude_unset=True))
    )
    db.execute(stmt)
    db.commit()
    return


def delete_interview_question(id: int, db: Session):
    stmt = delete(InterviewQuestion).where(InterviewQuestion.id == id)
    db.execute(stmt)
    db.commit()
    return
