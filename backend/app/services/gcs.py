from google.cloud import storage
from dotenv import load_dotenv
import os

load_dotenv()

storage_client = storage.Client()



def upload_file_to_gcs(bucket_name, destination_blob_name, source, content_type):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    if isinstance(source, str):
        blob.upload_from_filename(source, content_type=content_type)
    else:
        blob.upload_from_file(source, content_type=content_type)
    return blob.public_url


def get_blob_public_url(bucket_name, blob_name):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    return blob.public_url


def generate_signed_upload_url(bucket_name, blob_name, expiration=3600):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    url = blob.generate_signed_url(
        version="v4",
        expiration=expiration,
        method="PUT",
        content_type="application/octet-stream",
    )
    return url

def list_blobs_with_prefix(bucket_name, prefix):
    bucket = storage_client.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=prefix)
    return [blob.name for blob in blobs]

def delete_blob_from_gcs(bucket_name, blob_name):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.delete()
    return True
