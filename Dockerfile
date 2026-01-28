# ============================================================
#   BASE: JetPack 6.x
# ============================================================
FROM dustynv/l4t-ml:r36.4.0

ENV DEBIAN_FRONTEND=noninteractive

# ============================================================
#   SISTEMA: Solo lo esencial
# ============================================================
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    curl \
    python3-pip \
    python3-dev \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# ============================================================
#   INSTALAR yt-dlp
# ============================================================
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
        -o /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# ============================================================
#   DIRECTORIO DE TRABAJO
# ============================================================
WORKDIR /app

# ============================================================
#   COPIAR WHEELS (incluyendo TU wheel CUDA)
# ============================================================
COPY wheels/ /app/wheels/

# ============================================================
#   INSTALAR PYTHON DEPENDENCIAS BASE
# ============================================================
# Primero algunas dependencias base que PyTorch necesita
RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    typing_extensions==4.12.2

# ============================================================
#   INSTALAR TU WHEEL CUDA (el más crítico)
# ============================================================
RUN echo "Instalando tu wheel CUDA personalizado..." && \
    pip install --no-cache-dir /app/wheels/torch_cuda_jetpack-2.3.0-py3-none-any.whl

# ============================================================
#   VERIFICAR que CUDA funciona
# ============================================================
RUN python3 -c "\
import torch; \
print(f'[DOCKER BUILD] Torch version: {torch.__version__}'); \
print(f'[DOCKER BUILD] CUDA version: {torch.version.cuda}'); \
print(f'[DOCKER BUILD] CUDA available: {torch.cuda.is_available()}'); \
"

# ============================================================
#   INSTALAR TORCHAUDIO y TORCHVISION
# ============================================================
RUN pip install --no-cache-dir /app/wheels/torchaudio-2.3.0+952ea74-cp310-cp310-linux_aarch64.whl
RUN pip install --no-cache-dir /app/wheels/torchvision-0.18.0a0+6043bc2-cp310-cp310-linux_aarch64.whl

# ============================================================
#   INSTALAR WHISPER
# ============================================================
RUN pip install --no-cache-dir /app/wheels/openai_whisper-20250625-py3-none-any.whl

# ============================================================
#   INSTALAR ONNX RUNTIME GPU
# ============================================================
RUN pip install --no-cache-dir /app/wheels/onnxruntime_gpu-1.19.0-cp310-cp310-linux_aarch64.whl

# ============================================================
#   VERIFICAR WHISPER
# ============================================================
RUN python3 -c "\
import whisper; \
print(f'[DOCKER BUILD] Whisper version: {whisper.__version__}'); \
"

# ============================================================
#   INSTALAR DEPENDENCIAS DEL PROYECTO
# ============================================================
# Primero copiar requirements_clean.txt
COPY requirements_clean.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================
#   COPIAR EL RESTO DEL PROYECTO
# ============================================================
COPY . /app

EXPOSE 8000

# ============================================================
#   CONFIGURACIÓN CUDA
# ============================================================
ENV CUDA_VISIBLE_DEVICES=0
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

# ============================================================
#   COMANDO POR DEFECTO
# ============================================================
CMD ["uvicorn", "transcriber_app.web.web_app:app", "--host", "0.0.0.0", "--port", "8000"]