# TranscriberApp

TranscriberApp es una herramienta modular diseñada para:

- **Transcribir audios mediante Whisper** con aceleración GPU en Jetson
- **Procesar textos directamente** con análisis avanzado
- **Generar resúmenes inteligentes** usando Gemini (Google Generative AI)
- **Extraer tareas de reuniones** (modo refinamiento)
- **Crear resúmenes técnicos, ejecutivos o en bullet points**
- **Guardar resultados en formato Markdown**
- **Ejecutar en contenedores Docker** con soporte CUDA completo

---

## 🚀 Características principales

- **Transcripción automática** de archivos `.mp3` con Whisper en GPU
- **Procesamiento directo** de archivos `.txt`
- **Modos de análisis**: técnico, refinamiento, ejecutivo, bullet, default
- **Salida estructurada** en `outputs/`
- **Transcripciones guardadas** en `transcripts/`
- **Arquitectura modular y extensible**
- **Soporte completo para NVIDIA Jetson** (Orin Nano, Xavier, etc.)
- **Dockerización completa** con soporte CUDA
- **Wheels personalizados** para PyTorch CUDA en JetPack 6.x

---

## 🖥️ Compatibilidad

### **Entornos soportados:**
- ✅ **NVIDIA Jetson** (Orin Nano, Xavier, AGX Orin) con JetPack 6.x
- ✅ **Ubuntu 22.04+** con NVIDIA GPU
- ✅ **Docker con soporte NVIDIA GPU**
- ✅ **Entornos virtuales Python 3.10**

### **Requisitos específicos para Jetson:**
- JetPack 6.0 o superior
- CUDA 12.2+
- Python 3.10
- 8GB+ RAM recomendado

---

## 📦 Stack tecnológico

### **Backend:**
- **Whisper** (OpenAI) - Transcripción de audio
- **PyTorch 2.3.0 + CUDA 12.4** - Aceleración GPU
- **FastAPI** - API web
- **Google Gemini API** - Análisis y resumen de texto
- **ONNX Runtime GPU** - Optimización inferencia

### **Infraestructura:**
- **Docker** con runtime NVIDIA
- **Docker Compose** para orquestación
- **Wheels personalizados** para compatibilidad Jetson

### **Dependencias principales:**
```txt
google-generativeai      # Cliente oficial para modelos Gemini
torch>=2.3.0             # PyTorch con CUDA para Jetson
whisper                  # Motor de transcripción de audio
fastapi                  # Framework web asíncrono
uvicorn                  # Servidor ASGI
```

---

## 🏗️ Arquitectura del proyecto

```
TranscriberApp/
│
├── audios/                     # Archivos .mp3 de entrada
├── transcripts/                # Transcripciones generadas (.txt)
├── outputs/                    # Resultados finales (.md)
├── wheels/                     # Wheels personalizados para Jetson
│   ├── torch_cuda_jetpack-2.3.0-py3-none-any.whl    # PyTorch CUDA personalizado
│   ├── torchaudio-2.3.0+952ea74-cp310-cp310-linux_aarch64.whl
│   ├── torchvision-0.18.0a0+6043bc2-cp310-cp310-linux_aarch64.whl
│   ├── openai_whisper-20250625-py3-none-any.whl
│   └── onnxruntime_gpu-1.19.0-cp310-cp310-linux_aarch64.whl
│
├── transcriber_app/
│   ├── main.py                 # Punto de entrada principal
│   ├── modules/
│   │   ├── audio_receiver.py   # Carga de audio
│   │   ├── audio_downloader.py # Descarga de audio desde URL
│   │   ├── transcriber.py      # Whisper con CUDA
│   │   ├── gemini_client.py    # Cliente Gemini
│   │   ├── summarizer.py       # Lógica de resumen
│   │   ├── output_formatter.py # Guardado de resultados
│   │   ├── prompt_factory.py   # Prompts por modo
│   │   └── logging/            # Configuración de logs
│   ├── runner/
│   │   └── orchestrator.py     # Orquestación del pipeline
│   └── web/
│       ├── web_app.py          # Aplicación FastAPI
│       ├── api/                # Endpoints REST
│       └── static/             # Interfaz web
│
├── docker-compose.yml          # Orquestación Docker
├── Dockerfile                  # Imagen Docker optimizada para Jetson
├── requirements_clean.txt      # Dependencias Python
├── requirements.txt           # Dependencias completas (incluye wheels)
├── .env                       # Variables de entorno
└── README.md
```

---

## ⚙️ Instalación

### **Opción 1: Entorno virtual (desarrollo)**

```bash
# 1. Clonar repositorio
git clone <repositorio>
cd TranscriberApp

# 2. Crear entorno virtual
python3 -m venv venv_transcriber
source venv_transcriber/bin/activate

# 3. Instalar dependencias
pip install -r requirements_clean.txt

# 4. Instalar wheels CUDA personalizados (Jetson)
pip install wheels/torch_cuda_jetpack-2.3.0-py3-none-any.whl
pip install wheels/torchaudio-2.3.0+952ea74-cp310-cp310-linux_aarch64.whl
pip install wheels/torchvision-0.18.0a0+6043bc2-cp310-cp310-linux_aarch64.whl
pip install wheels/openai_whisper-20250625-py3-none-any.whl
pip install wheels/onnxruntime_gpu-1.19.0-cp310-cp310-linux_aarch64.whl

# 5. Configurar API Key
echo "GEMINI_API_KEY=TU_API_KEY_AQUI" > .env
```

### **Opción 2: Docker (producción)**

```bash
# 1. Construir imagen (con soporte CUDA)
docker build -t transcriberapp:golden .

# 2. Verificar CUDA en contenedor
docker run --rm --gpus all transcriberapp:golden \
  python3 -c "import torch; print(f'CUDA disponible: {torch.cuda.is_available()}')"

# 3. Ejecutar con Docker Compose
docker-compose up -d
```

### **Opción 3: Docker Compose (recomendada)**

```yaml
# docker-compose.yml
version: "3.9"

services:
  transcriberapp:
    build: .
    image: transcriberapp:golden
    container_name: transcriberapp
    restart: unless-stopped
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility
    ports:
      - "8000:8000"
    volumes:
      - ./audios:/app/audios
      - ./outputs:/app/outputs
      - ./transcripts:/app/transcripts
    env_file:
      - .env
```

```bash
# Ejecutar
docker-compose up -d
```

---

## 🎯 Modos disponibles

| Modo | Descripción | Uso típico |
|------|-------------|------------|
| `default` | Resumen simple y general | Reuniones informales |
| `tecnico` | Resumen técnico avanzado | Sprint planning, revisiones técnicas |
| `refinamiento` | Extrae tareas, subtareas, decisiones y backlog | Refinement sessions |
| `ejecutivo` | Resumen ejecutivo conciso (5-8 líneas) | Reportes a dirección |
| `bullet` | Resumen en puntos clave | Notas rápidas, seguimiento |

---

## 🚀 Ejecución

### **1. CLI (modo desarrollo)**

```bash
# Activar entorno
source venv_transcriber/bin/activate

# Transcribir audio
python -m transcriber_app.main audio ejemplo1 tecnico

# Procesar texto existente
python -m transcriber_app.main texto ejemplo1 refinamiento

# Descargar audio desde URL
python transcriber_app/modules/audio_downloader.py "https://youtube.com/watch?v=..."
```

### **2. Web API (modo producción)**

```bash
# Iniciar servidor web
uvicorn transcriber_app.web.web_app:app --host 0.0.0.0 --port 8000

# O usando Docker
docker-compose up -d
```

Acceder a: `http://localhost:8000`

### **3. Docker CLI**

```bash
# Transcribir audio
docker run --rm --gpus all \
  -v $(pwd)/audios:/app/audios \
  -v $(pwd)/outputs:/app/outputs \
  transcriberapp:golden \
  python3 -m transcriber_app.main audio ejemplo1 tecnico

# Verificar CUDA
docker run --rm --gpus all transcriberapp:golden \
  python3 -c "import torch; print(f'Torch CUDA: {torch.cuda.is_available()}')"
```

---

## 📁 Estructura de archivos generados

### **Entrada:**
```
audios/
└── reunion1.mp3
```

### **Salida:**
```
transcripts/
└── reunion1.txt          # Transcripción completa

outputs/
└── reunion1_tecnico.md   # Resumen analizado
```

### **Formato del archivo .md:**
```markdown
# Resumen Técnico - reunion1

## 📝 Resumen
[Resumen generado por Gemini...]

## 🔧 Puntos técnicos clave
- [Punto 1...]
- [Punto 2...]

## 🎯 Próximos pasos
- [Acción 1...]
- [Acción 2...]

---
*Generado por TranscriberApp con Whisper + Gemini*
```

---

## 🔧 Configuración avanzada

### **Variables de entorno (.env):**
```bash
GEMINI_API_KEY=tu_api_key_aqui
CUDA_VISIBLE_DEVICES=0
MODEL_SIZE=base              # Whisper model: tiny, base, small, medium
TARGET_LANG=es               # Idioma objetivo
LOG_LEVEL=INFO              # DEBUG, INFO, WARNING, ERROR
```

### **Configuración de Whisper:**
```python
# En transcriber_app/modules/transcriber.py
MODEL_SIZE = "base"          # Balance entre velocidad y precisión
DEVICE = "cuda"              # Usar GPU
COMPUTE_TYPE = "float16"     # Precisión mixta para Jetson
```

### **Configuración de Gemini:**
```python
# En transcriber_app/modules/gemini_client.py
MODEL_NAME = "gemini-2.5-flash-lite"  # Modelo Gemini
TEMPERATURE = 0.7
MAX_TOKENS = 2048
```

---

## 🐛 Solución de problemas

### **Problema: CUDA no disponible en Docker**
```bash
# Verificar que Docker tiene acceso a GPU
docker run --rm --gpus all nvidia/cuda:12.2.0-base-ubuntu20.04 nvidia-smi

# Reconstruir con soporte NVIDIA
docker build --no-cache -t transcriberapp:golden .
```

### **Problema: PyTorch sin CUDA en Jetson**
```bash
# Usar wheels personalizados incluidos
pip install wheels/torch_cuda_jetpack-2.3.0-py3-none-any.whl

# Verificar instalación
python -c "import torch; print(torch.cuda.is_available())"
```

### **Problema: Memoria insuficiente en Jetson**
```bash
# Usar modelo Whisper más pequeño
export MODEL_SIZE=tiny

# Reducir batch size
export WHISPER_BATCH_SIZE=1
```

### **Problema: API Gemini no responde**
```bash
# Verificar API key
echo $GEMINI_API_KEY

# Probar conexión
python -c "import google.generativeai as genai; genai.configure(api_key='TU_KEY'); print('OK')"
```

---

## 📊 Rendimiento en Jetson Orin Nano

| Componente | Tiempo (30min audio) | Memoria GPU |
|------------|----------------------|-------------|
| Whisper (base) | ~2-3 minutos | ~2GB |
| Gemini (flash-lite) | ~5-10 segundos | <1GB |
| Total pipeline | ~3-4 minutos | ~3GB |

**Optimizaciones aplicadas:**
- PyTorch compilado para CUDA 12.4
- Whisper con soporte FP16
- Modelo Gemini optimizado para baja latencia
- Cache de modelos en memoria

---

## 🔄 Flujo de trabajo típico

1. **Grabar reunión** → `reunion_sprint.mp3`
2. **Subir audio** a `audios/`
3. **Ejecutar transcripción**:
   ```bash
   python -m transcriber_app.main audio reunion_sprint refinamiento
   ```
4. **Revisar resultados** en `outputs/reunion_sprint_refinamiento.md`
5. **Exportar a Jira/Linear** (manual o script)

---

## 📈 Roadmap

### **Próximas características:**
- [ ] Exportación automática a Jira/Linear
- [ ] Modo "acta de reunión" con asistencia
- [ ] Resumen para email automático
- [ ] Dashboard web con historial
- [ ] Soporte multi-idioma automático
- [ ] Cache inteligente de transcripciones

### **Mejoras técnicas:**
- [ ] Whisper large-v3 con optimizaciones
- [ ] Streaming en tiempo real
- [ ] Diarización (identificación de hablantes)
- [ ] Compresión de audio inteligente

---

## 🛡️ Notas importantes

### **Seguridad:**
- Las API keys se almacenan en `.env` (no commitear)
- Las transcripciones se guardan localmente
- Conexiones SSL para APIs externas

### **Limitaciones:**
- Audio máximo recomendado: 60 minutos
- Requiere conexión a Internet para Gemini
- Jetson requiere JetPack 6.x para CUDA 12.4

### **Backup de wheels CUDA:**
```bash
# Los wheels personalizados son únicos
cp wheels/torch_cuda_jetpack-2.3.0-py3-none-any.whl ~/backups/
# Guardar en múltiples ubicaciones
```

---

## 🤝 Contribuciones

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

## ✨ Agradecimientos

- **OpenAI** por Whisper
- **Google** por Gemini API
- **NVIDIA** por JetPack y soporte Jetson
- **FastAPI** por el framework web
- **Todos los contribuidores** de código abierto

---

## 📞 Soporte

Para soporte, abrir un issue en GitHub o contactar al mantenedor.

**¡Happy transcribing! 🎙️→📝**

---

*Última actualización: Enero 2025*  
*Versión: 2.0.0 (Gold Edition)*  
*Optimizado para NVIDIA Jetson con CUDA*