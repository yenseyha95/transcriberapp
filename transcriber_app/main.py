import os
import sys
from dotenv import load_dotenv

from transcriber_app.modules.audio_receiver import AudioReceiver
from transcriber_app.modules.transcriber import Transcriber
from transcriber_app.modules.gemini_client import GeminiClient
from transcriber_app.modules.summarizer import Summarizer
from transcriber_app.modules.output_formatter import OutputFormatter
from transcriber_app.runner.orchestrator import Orchestrator
from transcriber_app.modules.prompt_factory import PromptFactory


def main():
    load_dotenv()

    # ============================
    #   VALIDACIÓN DE ARGUMENTOS
    # ============================
    if len(sys.argv) < 4:
        print("Uso: python -m transcriber_app.main [audio|texto] [nombre] [modo]")
        print("\nModos disponibles:")
        for m in PromptFactory.AVAILABLE_MODES:
            print(f" - {m}")
        return

    input_type = sys.argv[1].lower()
    base_name = sys.argv[2]
    mode = sys.argv[3].lower()

    if mode not in PromptFactory.AVAILABLE_MODES:
        print(f"❌ Modo no válido: {mode}\n")
        print("Modos disponibles:")
        for m in PromptFactory.AVAILABLE_MODES:
            print(f" - {m}")
        return

    # ============================
    #   RESOLVER RUTA SEGÚN TIPO
    # ============================
    if input_type == "audio":
        if not base_name.endswith(".mp3"):
            base_name += ".mp3"
        path = os.path.join("audios", base_name)

    elif input_type == "texto":
        if not base_name.endswith(".txt"):
            base_name += ".txt"
        path = os.path.join("transcripts", base_name)

    else:
        print("❌ Primer parámetro debe ser 'audio' o 'texto'")
        return

    if not os.path.exists(path):
        print(f"❌ No existe el archivo: {path}")
        return

    # ============================
    #   INICIALIZAR PIPELINE
    # ============================
    idioma_salida = "español"

    receiver = AudioReceiver()
    transcriber = Transcriber(model_name="small")
    gemini = GeminiClient(
        api_key=os.getenv("GEMINI_API_KEY"),
        model="gemini-2.5-flash-lite",
        target_lang=idioma_salida
    )
    summarizer = Summarizer(gemini)
    formatter = OutputFormatter()

    orchestrator = Orchestrator(receiver, transcriber, summarizer, formatter)

    # ============================
    #   EJECUTAR PIPELINE
    # ============================
    if input_type == "audio":
        output = orchestrator.run_audio(path, mode)
    else:
        output = orchestrator.run_text(path, mode)

    print(output)


if __name__ == "__main__":
    main()
