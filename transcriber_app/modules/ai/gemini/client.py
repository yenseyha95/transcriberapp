# transcriber_app/modules/ai/gemini/client.py

from transcriber_app.modules.ai.base.model_interface import AIModel
from starlette.responses import Response
from transcriber_app.modules.logging.logging_config import setup_logging
from .agents import (
    tecnico_agent,
    ejecutivo_agent,
    refinamiento_agent,
    bullet_agent,
    default_agent,
)


# Logging
logger = setup_logging("transcribeapp")


class GeminiModel(AIModel):
    """
    Modelo Gemini:
    - NO transcribe audio
    - Solo ejecuta agentes y prompts
    """

    def __init__(self):
        # Diccionario de agentes
        self.agents = {
            "tecnico": tecnico_agent,
            "ejecutivo": ejecutivo_agent,
            "refinamiento": refinamiento_agent,
            "bullet": bullet_agent,
            "default": default_agent,
        }

    def run_agent(self, mode: str, text: str, stream: bool = False):
        agent = self.agents.get(mode, default_agent)

        result = agent.run(text, stream=stream)
        logger.info(f"[GEMINI MODEL] Tipo bruto: {type(result)} - {repr(result)[:200]}")

        # Solo aceptamos dos cosas: str o Response
        if isinstance(result, str):
            logger.info(f"[GEMINI MODEL] Resultado (str): {result[:100]}...")
            return result

        if isinstance(result, Response):
            body = result.body.decode(result.charset or "utf-8")
            logger.info(f"[GEMINI MODEL] Resultado (Response): {body[:100]}...")
            return body

        # Cualquier otra cosa → error explícito
        raise RuntimeError(f"[GEMINI MODEL] Tipo inesperado en run_agent: {type(result)} - {repr(result)[:200]}")
