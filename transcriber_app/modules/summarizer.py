class Summarizer:
    def __init__(self, gemini_client):
        self.client = gemini_client

    def summarize(self, text: str, mode="default"):
        return self.client.analyze(text, mode)
