import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

# Konfiguration
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
PORT = int(os.getenv("AI_SERVICE_PORT", "9001"))

app = FastAPI(title="AI Inquiry Categorization Service")

# CORS aktivieren für lokale Kommunikation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CategorizationRequest(BaseModel):
    subject: str
    message: str
    user_id: Optional[str] = None


class CategorizationResponse(BaseModel):
    category: str
    confidence: float
    reasoning: Optional[str] = None


# Verfügbare Kategorien (basierend auf Supabase Schema)
CATEGORIES = {
    "general": "Allgemeine Anfragen",
    "technical": "Technische Probleme oder Support",
    "billing": "Rechnungen, Zahlungen, Preise",
    "feedback": "Feedback, Vorschläge, Bewertungen",
    "other": "Sonstige Anfragen"
}


def build_categorization_prompt(subject: str, message: str) -> str:
    """Erstellt den Prompt für die KI-Kategorisierung"""
    categories_list = "\n".join([f"- {key}: {value}" for key, value in CATEGORIES.items()])
    
    return f"""Du bist ein Kategorisierungs-Assistent für Kundenanfragen.

Verfügbare Kategorien:
{categories_list}

Analysiere folgende Anfrage und wähle die passendste Kategorie:

Betreff: {subject}
Nachricht: {message}

Antworte NUR mit dem Kategorie-Schlüssel (z.B. "technical", "billing", etc.) ohne zusätzlichen Text.
Kategorie:"""


@app.post("/categorize", response_model=CategorizationResponse)
async def categorize_inquiry(request: CategorizationRequest):
    """Kategorisiert eine Inquiry basierend auf Betreff und Nachricht"""
    
    if not request.subject or not request.message:
        raise HTTPException(status_code=400, detail="Subject and message are required")
    
    try:
        # Prompt erstellen
        prompt = build_categorization_prompt(request.subject, request.message)
        
        # Ollama aufrufen
        response = ollama.generate(
            model=OLLAMA_MODEL,
            prompt=prompt,
            options={
                "temperature": 0.3,  # Niedrig für konsistente Kategorisierung
                "top_p": 0.9,
            }
        )
        
        # Antwort extrahieren und bereinigen
        category_raw = response['response'].strip().lower()
        
        # Kategorie validieren und normalisieren
        category = None
        for valid_category in CATEGORIES.keys():
            if valid_category in category_raw:
                category = valid_category
                break
        
        # Fallback auf "general" wenn keine Kategorie erkannt wurde
        if not category:
            category = "general"
        
        # Confidence-Score (vereinfacht - könnte verbessert werden)
        confidence = 0.85 if category != "general" else 0.5
        
        return CategorizationResponse(
            category=category,
            confidence=confidence,
            reasoning=f"Kategorisiert als '{category}' basierend auf Inhalt"
        )
        
    except Exception as e:
        print(f"Error during categorization: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Categorization failed: {str(e)}"
        )


@app.get("/healthz")
def healthcheck():
    """Health check endpoint"""
    try:
        # Prüfe ob Ollama erreichbar ist
        ollama.list()
        return {
            "status": "ok",
            "model": OLLAMA_MODEL,
            "ollama_available": True
        }
    except Exception as e:
        return {
            "status": "degraded",
            "model": OLLAMA_MODEL,
            "ollama_available": False,
            "error": str(e)
        }


@app.get("/categories")
def get_categories():
    """Gibt verfügbare Kategorien zurück"""
    return {
        "categories": CATEGORIES
    }


if __name__ == "__main__":
    import uvicorn
    print(f"Starting AI Categorization Service on port {PORT}")
    print(f"Using Ollama model: {OLLAMA_MODEL}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
