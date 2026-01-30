# transcriber_app/api/models.py
from pydantic import BaseModel

class ChatRequest(BaseModel):
    transcripcion: str
    resumen: str
    pregunta: str
