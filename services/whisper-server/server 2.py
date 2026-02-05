from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import os
import time
from dotenv import load_dotenv
from pydantic import BaseModel
from agent import CalendarAgent

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Whisper Model
# model_size = "large-v3"
# model_size = "medium"
model_size = "base"
print(f"Loading Whisper model '{model_size}'...")
model = WhisperModel(model_size, device="cpu", compute_type="int8")
print("Whisper model loaded successfully!")

# Initialize Calendar Agent
try:
    agent = CalendarAgent()
    print("✅ Calendar Agent initialized!")
except Exception as e:
    print(f"❌ Failed to initialize Calendar Agent: {e}")
    agent = None

@app.post("/transcribe-file")
async def transcribe_file(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Save uploaded file temporarily
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        # Transcribe
        segments, info = model.transcribe(temp_filename, beam_size=5)
        
        transcription_text = ""
        for segment in segments:
            transcription_text += segment.text + " "
            
        execution_time = time.time() - start_time
        
        return {
            "text": transcription_text.strip(),
            "language": info.language,
            "probability": info.language_probability,
            "duration": execution_time
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

from typing import Optional

class CommandRequest(BaseModel):
    text: str
    auth_token: Optional[str] = None # Optional user token
    dry_run: bool = False # Optional confirmation flag

@app.post("/process-command")
async def process_command(request: CommandRequest):
    """
    Receives text command and optional auth token.
    Interprets it via Local AI and executes on Google Calendar.
    """
    if not agent:
        return {"status": "error", "message": "Calendar Agent not initialized. Check server logs."}
    
    result = agent.process(request.text, request.auth_token, request.dry_run)
    return result

# --- Mail Agent Integration ---
from mail_agent import MailAgent
mail_agent = MailAgent()

class EmailScanRequest(BaseModel):
    auth_token: str
    user_id: str

@app.post("/scan-emails")
async def scan_emails(request: EmailScanRequest):
    """
    Scans unread emails from the connected Gmail account 
    and converts them to Supabase inquiries.
    """
    if not mail_agent:
        return {"status": "error", "message": "Mail Agent not initialized."}
    
    return mail_agent.scan_and_process(request.auth_token, request.user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
