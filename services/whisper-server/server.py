import base64
import binascii
import os
import tempfile
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from faster_whisper import WhisperModel


WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")

model = WhisperModel(WHISPER_MODEL, device=DEVICE, compute_type=COMPUTE_TYPE)

app = FastAPI(title="Whisper Transcription Service")


class TranscriptionRequest(BaseModel):
    audio: str
    language: Optional[str] = None
    task: str = "transcribe"  # or "translate"


class TranscriptionResponse(BaseModel):
    text: str
    language: Optional[str]
    duration: float


@app.post("/transcribe", response_model=TranscriptionResponse)
def transcribe(request: TranscriptionRequest):
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
    return {"status": "ok", "model": WHISPER_MODEL, "device": DEVICE}
