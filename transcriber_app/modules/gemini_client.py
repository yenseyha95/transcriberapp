import google.generativeai as genai
from transcriber_app.modules.prompt_factory import PromptFactory

class GeminiClient:
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash-lite", target_lang: str = "es"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)
        self.target_lang = target_lang
        self.prompt_factory = PromptFactory(target_lang)

    def analyze(self, text: str, mode: str = "default") -> dict:
        prompt = self.prompt_factory.get_prompt(mode, text)
        response = self.model.generate_content(prompt)
        return {"output": response.text}

