from fastapi import UploadFile
from app.services.gcs import upload_file_to_gcs, delete_blob_from_gcs
from app.config import settings
import uuid


def upload_resume_to_gcs(file: UploadFile, jobseeker_id: int, old_resume_url: str = None) -> str:
    """
    Uploads a resume file to GCS and returns the public URL.
    Deletes the old file if old_resume_url is provided and is a GCS URL.
    """
    bucket_name = settings.GCS_BUCKET_NAME
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
    destination_blob_name = f"resumes/jobseeker_{jobseeker_id}_{uuid.uuid4()}.{ext}"
    public_url = upload_file_to_gcs(
        bucket_name=bucket_name,
        destination_blob_name=destination_blob_name,
        source=file.file,
        content_type=file.content_type or 'application/pdf',
    )
    # Delete old file if applicable
    if old_resume_url and old_resume_url.startswith(f"https://storage.googleapis.com/{bucket_name}/"):
        old_blob_name = old_resume_url.split(f"https://storage.googleapis.com/{bucket_name}/", 1)[-1]
        try:
            print(f"Deleting old blob: {old_blob_name}")
            blob_deleted = delete_blob_from_gcs(bucket_name, old_blob_name)
            print(f"Blob deleted: {blob_deleted}")
        except Exception as e:
            print(f"Failed to delete old blob: {e}")
    return public_url


def upload_profile_picture_to_gcs(file: UploadFile, jobseeker_id: int, old_profile_picture_url: str = None) -> str:
    """
    Uploads a profile picture to GCS and returns the public URL.
    Deletes the old file if old_profile_picture_url is provided and is a GCS URL.
    """
    bucket_name = settings.GCS_BUCKET_NAME
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    destination_blob_name = f"profile_pictures/jobseeker_{jobseeker_id}_{uuid.uuid4()}.{ext}"
    public_url = upload_file_to_gcs(
        bucket_name=bucket_name,
        destination_blob_name=destination_blob_name,
        source=file.file,
        content_type=file.content_type or 'image/png',
    )
    # Delete old file if applicable
    if old_profile_picture_url and old_profile_picture_url.startswith(f"https://storage.googleapis.com/{bucket_name}/"):
        old_blob_name = old_profile_picture_url.split(f"https://storage.googleapis.com/{bucket_name}/", 1)[-1]
        try:
            print(f"Deleting old profile picture blob: {old_blob_name}")
            blob_deleted = delete_blob_from_gcs(bucket_name, old_blob_name)
            print(f"Profile picture blob deleted: {blob_deleted}")
        except Exception as e:
            print(f"Failed to delete old profile picture blob: {e}")
    return public_url
