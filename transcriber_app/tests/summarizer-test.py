from summarizer import Summarizer
from gemini_client import GeminiClient
import os

client = GeminiClient(api_key=os.getenv("GEMINI_API_KEY"))
summarizer = Summarizer(client)

result = summarizer.summarize("Texto de prueba.")
print(result["output"])
