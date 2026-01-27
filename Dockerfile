# ============================================================
#   BASE: JetPack 6.x + CUDA 12.6 + PyTorch 2.4.0 (NVIDIA)
# ============================================================
FROM nvcr.io/nvidia/l4t-base:r36.2.0

ENV DEBIAN_FRONTEND=noninteractive

# ============================================================
#   SISTEMA: ffmpeg, git, wget, yt-dlp, dependencias nativas
# ============================================================
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    wget \
    curl \
    python3-pip \
    python3-dev \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp actualizado
RUN pip install --no-cache-dir yt-dlp

# ============================================================
#   DIRECTORIO DE TRABAJO
# ============================================================
WORKDIR /app

# ============================================================
#   COPIAR PROYECTO
# ============================================================
COPY . /app

# ============================================================
#   INSTALAR DEPENDENCIAS DEL PROYECTO
# ============================================================
# Torch ya viene instalado en la imagen base (2.4.0 NVIDIA)
# Solo instalamos requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================
#   CONFIGURACIÓN CUDA PARA JETSON
# ============================================================
ENV CUDA_VISIBLE_DEVICES=0
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

# ============================================================
#   COMANDO POR DEFECTO
# ============================================================
CMD ["python3", "-m", "transcriber_app.main"]
