import os

class Orchestrator:
    def __init__(self, receiver, transcriber, summarizer, formatter):
        self.receiver = receiver
        self.transcriber = transcriber
        self.summarizer = summarizer
        self.formatter = formatter

    def run_audio(self, audio_path, mode="default"):
        audio_info = self.receiver.load(audio_path)
        text = self.transcriber.transcribe(audio_info["path"])
        self.formatter.save_transcription(audio_info["name"], text)
        summary = self.summarizer.summarize(text, mode)
        return self.formatter.save_output(audio_info["name"], summary["output"], mode)

    def run_text(self, text_path, mode="default"):
        name = os.path.splitext(os.path.basename(text_path))[0]

        with open(text_path, "r", encoding="utf-8") as f:
            text = f.read()

        summary = self.summarizer.summarize(text, mode)
        return self.formatter.save_output(name, summary["output"], mode)

