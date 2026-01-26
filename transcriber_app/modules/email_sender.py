import subprocess
from pathlib import Path

from .emails import RECIPIENTS


class EmailSender:
    def send_file(self, file_path: str, subject: str = "Transcripción generada"):
        """Envía el contenido del archivo usando el comando 'mail' del sistema."""

        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"❌ No existe el archivo: {file_path}")

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        for recipient in RECIPIENTS:
            subprocess.run(
                ["mail", "-s", subject, recipient],
                input=content.encode("utf-8"),
                check=True
            )

        return f"📨 Email enviado a: {', '.join(RECIPIENTS)}"
