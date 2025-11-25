import os
import json
import datetime
from openai import OpenAI
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Scopes required for Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

class CalendarAgent:
    def __init__(self):
        # Initialize Local LLM (Ollama)
        self.client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama" 
        )
        self.model_name = "llama3.2" 
        
        self.creds = None
        self.service = None
        
        # Initialize Google Calendar Service (Optional)
        try:
            self._authenticate_google()
        except Exception as e:
            print(f"⚠️ Google Calendar Auth failed: {e}")
            self.service = None

    def _authenticate_google(self):
        """Handles Google OAuth2 authentication."""
        creds = None
        token_path = 'token.json'
        creds_path = 'credentials.json'

        if not os.path.exists(creds_path) and not os.path.exists(token_path):
            print(f"⚠️ Warning: {creds_path} not found. Calendar actions will be simulated.")
            return

        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(creds_path):
                    return 
                
                flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open(token_path, 'w') as token:
                token.write(creds.to_json())

        self.creds = creds
        self.service = build('calendar', 'v3', credentials=creds)
        print("✅ Google Calendar Service authenticated successfully!")

    def interpret_command(self, text: str):
        """
        Uses Local LLM to interpret the natural language command.
        """
        current_time = datetime.datetime.now().isoformat()
        
        prompt = f"""
        You are a smart calendar assistant. 
        Current time: {current_time}
        
        User Input: "{text}"
        
        Your task:
        1. Identify the INTENT: 'create_event', 'delete_event', 'update_event', or 'unknown'.
        2. Extract event details: summary, start_time (ISO8601), end_time (ISO8601), description, location.
        3. If no duration is specified, assume 1 hour.
        4. Return ONLY valid JSON. No markdown.
        
        Example JSON structure:
        {{
            "intent": "create_event",
            "event": {{
                "summary": "Meeting with Tom",
                "start": {{ "dateTime": "2025-11-26T14:00:00", "timeZone": "Europe/Vienna" }},
                "end": {{ "dateTime": "2025-11-26T15:00:00", "timeZone": "Europe/Vienna" }},
                "description": "Discuss project status"
            }}
        }}
        """

        try:
            print(f"🤔 Asking Local AI ({self.model_name})...")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful calendar assistant that outputs JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"❌ Local AI Error: {e}")
            return {"intent": "error", "message": f"AI Error: {str(e)}. Is Ollama running?"}

    def execute_action(self, command_data: dict, auth_token: str = None):
        """
        Executes the action on Google Calendar based on the interpreted command.
        Uses auth_token if provided, otherwise falls back to local credentials (or simulation).
        """
        intent = command_data.get("intent")
        event_data = command_data.get("event")
        
        service = self.service

        # Dynamic Authentication if token is provided
        if auth_token:
            try:
                creds = Credentials(token=auth_token)
                service = build('calendar', 'v3', credentials=creds)
                print("✅ Using provided User Token for Google Calendar")
            except Exception as e:
                print(f"⚠️ Invalid User Token: {e}")
                return {"status": "error", "message": "Google Login ungültig. Bitte neu anmelden."}

        # Simulation mode if no service
        if not service:
            if intent == "create_event":
                return {
                    "status": "success", 
                    "message": f"[SIMULATION] Termin erstellt: {event_data.get('summary')} ({event_data.get('start', {}).get('dateTime')})",
                    "data": event_data
                }
            return {"status": "error", "message": "Google Calendar not authenticated (Simulation Mode)."}

        try:
            if intent == "create_event":
                event = service.events().insert(
                    calendarId='primary',
                    body=event_data
                ).execute()
                return {
                    "status": "success", 
                    "message": f"Termin erstellt: {event.get('htmlLink')}",
                    "data": event
                }
            
            elif intent == "unknown":
                return {"status": "error", "message": "Ich habe den Befehl nicht verstanden."}
            
            else:
                return {"status": "error", "message": f"Intent '{intent}' ist noch nicht implementiert."}

        except Exception as e:
            print(f"❌ Calendar API Error: {e}")
            return {"status": "error", "message": str(e)}

    def process(self, text: str, auth_token: str = None):
        """Main entry point: Interpret -> Execute"""
        print(f"🤖 Processing command: {text}")
        
        # 1. Interpret
        interpretation = self.interpret_command(text)
        print(f"🧠 Interpretation: {json.dumps(interpretation, indent=2)}")
        
        if interpretation.get("intent") == "error":
            return {"status": "error", "message": interpretation.get("message")}

        # 2. Execute
        result = self.execute_action(interpretation, auth_token)
        return result
