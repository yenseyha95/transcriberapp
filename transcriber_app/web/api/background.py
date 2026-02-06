# transcriber_app/web/api/background.py

from transcriber_app.runner.orchestrator import Orchestrator
from transcriber_app.modules.output_formatter import OutputFormatter
from transcriber_app.modules.audio_receiver import AudioReceiver
from transcriber_app.modules.ai.groq.transcriber import GroqTranscriber
from transcriber_app.modules.logging.logging_config import setup_logging
from .emailer import send_email_with_attachment
from pathlib import Path

# Logging
logger = setup_logging("transcribeapp")

JOB_STATUS = {}


def process_audio_job(job_id: str, nombre: str, modo: str, email: str):
    logger.info(f"[BACKGROUND JOB] Iniciando job {job_id}")
    logger.info(f"[BACKGROUND JOB] Parámetros: nombre={nombre!r}, modo={modo!r}, email={email!r}")

    try:
        JOB_STATUS[job_id] = "running"

        audio_path = Path("audios") / f"{nombre}.mp3"
        if not audio_path.exists():
            JOB_STATUS[job_id] = "error"
            logger.error(f"[BACKGROUND JOB] Audio no encontrado: {audio_path}")
            return

        # === USAR EL MISMO PIPELINE QUE EL CLI ===
        orchestrator = Orchestrator(
            receiver=AudioReceiver(),
            transcriber=GroqTranscriber(),
            formatter=OutputFormatter()
        )

        output_file = orchestrator.run_audio(str(audio_path), modo)

        logger.info(f"[BACKGROUND JOB] Archivo generado: {output_file}")

        send_email_with_attachment(
            to=email,
            subject=f"Transcripción lista: {nombre}",
            body="Adjunto encontrarás el archivo procesado.",
            attachment_path=str(output_file)
        )

        JOB_STATUS[job_id] = "done"
        logger.info(f"[BACKGROUND JOB] Job {job_id} finalizado correctamente")

    except Exception as e:
        JOB_STATUS[job_id] = "error"
        logger.error(f"[BACKGROUND JOB] Error en job {job_id}: {e}", exc_info=True)
