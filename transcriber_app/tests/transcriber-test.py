import asyncio
from transcriber import Transcriber

async def test():
    t = Transcriber(api_key=os.getenv("DEEPGRAM_API_KEY"))
    text = await t.transcribe("audios/ejemplo.mp3")
    print(text)

asyncio.run(test())
