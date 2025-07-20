import jwt
from jwt import exceptions
from app.config import settings


def encode(payload):
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode(encoded_jwt):
    decoded_data = jwt.decode(encoded_jwt, settings.SECRET_KEY, algorithms=["HS256"])
    return decoded_data
