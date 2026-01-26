import os

class AudioReceiver:
    def load(self, audio_path: str) -> dict:
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        return {
            "path": audio_path,
            "name": base_name
        }
