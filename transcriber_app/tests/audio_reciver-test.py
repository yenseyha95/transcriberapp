from audio_receiver import AudioReceiver

receiver = AudioReceiver()
info = receiver.load("audios/ejemplo.mp3")

print(info["path"])  # audios/ejemplo.mp3
print(info["name"])  # ejemplo
