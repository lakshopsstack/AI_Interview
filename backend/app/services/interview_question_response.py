from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from app import schemas
from app.models import InterviewQuestion, InterviewQuestionResponse


def create_interview_question_response(
    response_data: schemas.CreateInterviewQuestionResponse,
    interview_id: int,
    db: Session,
):
    data = response_data.model_dump()
    data["interview_id"] = interview_id
    stmt = insert(InterviewQuestionResponse).values(data)
    db.execute(stmt)
    db.commit()
    return


def get_interview_question_response_by_interview_id(interview_id: int, db: Session):
    stmt = (
        select(
            InterviewQuestionResponse.answer,
            InterviewQuestionResponse.question_id,
            InterviewQuestionResponse.interview_id,
            InterviewQuestionResponse.created_at,
            InterviewQuestion.job_id,
            InterviewQuestion.order_number,
            InterviewQuestion.question,
            InterviewQuestion.question_type,
        )
        .join(
            InterviewQuestion,
            InterviewQuestion.id == InterviewQuestionResponse.question_id,
        )
        .where(InterviewQuestionResponse.interview_id == interview_id)
    )
    return db.execute(stmt).mappings().all()
