from gemini_client import GeminiClient
import os

client = GeminiClient(api_key=os.getenv("GEMINI_API_KEY"))
result = client.analyze("Este es un texto de prueba.")
print(result["output"])
