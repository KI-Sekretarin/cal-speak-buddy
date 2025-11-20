import base64
import binascii
import os
import tempfile
from typing import Optional

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from faster_whisper import WhisperModel


WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")  # base ist schneller als small
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")

# Model beim Start laden für schnellere Verarbeitung
print(f"Loading Whisper model: {WHISPER_MODEL} on {DEVICE} with {COMPUTE_TYPE}")
model = WhisperModel(WHISPER_MODEL, device=DEVICE, compute_type=COMPUTE_TYPE)
print("Model loaded successfully!")

app = FastAPI(title="Whisper Transcription Service")

# CORS aktivieren für lokale Frontend-Kommunikation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion spezifischer machen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranscriptionRequest(BaseModel):
    audio: str
    language: Optional[str] = "de"  # Default auf Deutsch
    task: str = "transcribe"  # or "translate"


class TranscriptionResponse(BaseModel):
    text: str
    language: Optional[str]
    duration: float


@app.post("/transcribe", response_model=TranscriptionResponse)
def transcribe(request: TranscriptionRequest):
    """Transkribiere Audio von Base64-kodiertem String"""
    if not request.audio:
        raise HTTPException(status_code=400, detail="No audio data provided")

    try:
        audio_bytes = base64.b64decode(request.audio)
    except binascii.Error:
        raise HTTPException(status_code=400, detail="Invalid base64 audio payload")

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_path = tmp_file.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language=request.language,
            task=request.task,
            beam_size=1,  # Schneller, etwas weniger genau
            vad_filter=True,  # Voice Activity Detection für bessere Qualität
        )

        text = " ".join(segment.text.strip() for segment in segments).strip()
        return TranscriptionResponse(
            text=text,
            language=info.language,
            duration=info.duration,
        )
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


@app.post("/transcribe-file", response_model=TranscriptionResponse)
async def transcribe_file(
    file: UploadFile = File(...),
    language: Optional[str] = "de",
    task: str = "transcribe"
):
    """Transkribiere Audio von hochgeladener Datei (schneller als Base64)"""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Temporäre Datei erstellen
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language=language,
            task=task,
            beam_size=1,  # Schneller
            vad_filter=True,  # Voice Activity Detection
        )

        text = " ".join(segment.text.strip() for segment in segments).strip()
        return TranscriptionResponse(
            text=text,
            language=info.language,
            duration=info.duration,
        )
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


@app.get("/healthz")
def healthcheck():
    return {
        "status": "ok", 
        "model": WHISPER_MODEL, 
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE
    }
