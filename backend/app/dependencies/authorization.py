from fastapi import Request, HTTPException
from app.lib.errors import CustomException
from app.lib import jwt


def authorize_company(request: Request):
    try:
        authorization_header = request.headers.get("authorization")
        if not authorization_header:
            raise CustomException(code=401, message="Unauthorized")
        token = authorization_header.split("Bearer ")[1]
        decoded_data = jwt.decode(token)

        return decoded_data["id"]
    except jwt.exceptions.ExpiredSignatureError:
        raise CustomException("Authentication token expired", code=401)


def authorize_candidate(request: Request):
    try:
        authorization_header = request.headers.get("authorization")
        if not authorization_header:
            raise CustomException(code=401, message="Unauthorized")
        token = authorization_header.split("Bearer ")[1]
        decoded_data = jwt.decode(token)

        return decoded_data["interview_id"]
    except jwt.exceptions.ExpiredSignatureError:
        raise CustomException("Authentication token expired", code=401)
