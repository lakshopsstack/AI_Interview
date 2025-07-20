import razorpay

from app import config

razorpay_client = razorpay.Client(
    auth=(config.settings.RAZORPAY_KEY_ID, config.settings.RAZORPAY_KEY_SECRET)
)
