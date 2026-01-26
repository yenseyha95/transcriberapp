from output_formatter import OutputFormatter

formatter = OutputFormatter()
path = formatter.save({"output": "# Resumen\nTexto..."}, "mi_audio")
print(path)  # outputs/mi_audio.md
