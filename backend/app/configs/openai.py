import httpx
import openai

from app.config import settings


client = openai.AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY, http_client=httpx.AsyncClient()
)
print("OpenAI client initialized successfully")
