from app import config
from app.configs.brevo import api_instance
from brevo_python.rest import ApiException
import brevo_python
import os
import logging

from app.lib.errors import CustomException

logger = logging.getLogger(__name__)

def send_otp_email(to: str, otp: str, expiration_time: str):
    try:
        logger.info(f"Attempting to send OTP email to {to}")
        
        html_content = f"""
            <h1>Edudiagno</h1>
            <p>Your OTP is: {otp}</p>
            <p>OTP is valid for {expiration_time}.</p>
        """
        
        if not config.settings.BREVO_API_KEY:
            logger.error("BREVO_API_KEY is not set in environment variables")
            raise CustomException("Email service configuration error")
            
        if not config.settings.MAIL_SENDER_EMAIL or not config.settings.MAIL_SENDER_NAME:
            logger.error("MAIL_SENDER_EMAIL or MAIL_SENDER_NAME is not set in environment variables")
            raise CustomException("Email sender configuration error")

        send_smtp_email = brevo_python.SendSmtpEmail(
            sender={
                "name": config.settings.MAIL_SENDER_NAME,
                "email": config.settings.MAIL_SENDER_EMAIL,
            },
            to=[{"email": to}],
            html_content=html_content,
            subject="OTP for Edudiagno Jobs Portal",
        )

        logger.info("Sending email via Brevo API")
        api_instance.send_transac_email(send_smtp_email)
        logger.info("Email sent successfully")
        
    except ApiException as e:
        logger.error(f"Brevo API error: {str(e)}")
        logger.error(f"Error body: {e.body}")
        logger.error(f"Error headers: {e.headers}")
        raise CustomException("Could not send OTP. Please try again later.")
    except Exception as e:
        logger.error(f"Unexpected error while sending email: {str(e)}")
        raise CustomException("Could not send OTP. Please try again later.")
