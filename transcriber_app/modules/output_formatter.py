import os

class OutputFormatter:
    def save_output(self, base_name: str, content: str, mode: str) -> str:
        os.makedirs("outputs", exist_ok=True)

        # nombre_final = base + "_" + modo + ".md"
        output_filename = f"{base_name}_{mode}.md"
        output_path = os.path.join("outputs", output_filename)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)

        return output_path

    def save_transcription(self, base_name: str, text: str) -> str:
        os.makedirs("transcripts", exist_ok=True)
        path = f"transcripts/{base_name}.txt"
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        return path
