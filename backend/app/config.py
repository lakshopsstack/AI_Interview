import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    URL: str = os.getenv("URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-keep-it-secret")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRATION_MINUTES", "3")
    )
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:8080,http://localhost:5173,http://127.0.0.1:8080,http://127.0.0.1:5173",
    ).split(",")

    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET")

    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    FERMION_API_KEY: str = os.getenv("FERMION_API_KEY", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY")
    MAIL_SENDER_NAME: str = os.getenv("MAIL_SENDER_NAME")
    MAIL_SENDER_EMAIL: str = os.getenv("MAIL_SENDER_EMAIL")

    OTP_EXPIRY_DURATION_SECONDS: int = int(
        os.getenv("OTP_EXPIRY_DURATION_SECONDS", "300")
    )

    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME")

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8080")


settings = Settings()
