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
        self.model_name = "qwen2.5:14b" 
        
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
        # Get current time with timezone info
        current_time = datetime.datetime.now().astimezone().isoformat()
        
        prompt = f"""
        You are a smart calendar assistant for a German user.
        Current time: {current_time}
        
        User Input: "{text}"
        
        Your task:
        1. Correct transcription errors based on context.
        2. Identify the INTENT: 'create_event', 'delete_event', 'update_event', 'list_events', or 'unknown'.
        3. Extract event details: summary, start_time (ISO8601), end_time (ISO8601), description, location.
        4. **Handling "Delete All"**:
           - If user says "delete all", "clear schedule", "alles löschen", set "delete_all": true.
           - Extract correct time range ("today" -> timeMin=00:00, timeMax=23:59).
           - Do NOT put "all events" as summary. Leave summary empty/null if it's a bulk delete.
        5. Return ONLY valid JSON. No markdown.
        
        Examples:
        - "Lege einen Termin mit Mark an" -> intent: create_event, summary: "Treffen mit Mark"
        - "Zeige meine Termine" -> intent: list_events
        - "Lösche alle Termine heute" -> intent: delete_event, delete_all: true, timeMin: "2025-12-31T00:00:00", timeMax: "2025-12-31T23:59:59"
        - "Lösche den Termin Morgen" -> intent: delete_event, delete_all: false
        
        Example JSON structure for create_event:
        {{
            "intent": "create_event",
            "event": {{
                "summary": "Meeting with Tom",
                "start": {{ "dateTime": "2025-11-26T14:00:00+01:00", "timeZone": "Europe/Vienna" }},
                "end": {{ "dateTime": "2025-11-26T15:00:00+01:00", "timeZone": "Europe/Vienna" }}
            }}
        }}

        Example JSON structure for delete_event:
        {{
            "intent": "delete_event",
            "event": {{
                "summary": "Meeting with Tom",
                "delete_all": false,
                "timeMin": "{current_time}",
                "timeMax": "2025-12-31T23:59:59+01:00"
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

    def _find_event(self, summary: str, time_min: str = None):
        """Finds an event by summary using LLM for fuzzy matching."""
        if not self.service: return None
        
        if not time_min:
            time_min = datetime.datetime.now().astimezone().isoformat()
        
        # Ensure timezone
        if 'T' in time_min and not ('Z' in time_min or '+' in time_min[-6:] or '-' in time_min[-6:]):
             time_min = time_min + 'Z'

        print(f"🔍 Searching for event '{summary}' after {time_min}...")
        try:
            # 1. Fetch candidates
            events_result = self.service.events().list(
                calendarId='primary', timeMin=time_min, maxResults=20, singleEvents=True, orderBy='startTime'
            ).execute()
            events = events_result.get('items', [])
            
            if not events: return None

            # 2. Prepare for LLM
            event_list_str = "\n".join([
                f"- ID: {e['id']}, Summary: {e.get('summary', 'No Title')}, Time: {e['start'].get('dateTime', e['start'].get('date'))}"
                for e in events
            ])
            
            user_requirement = f'matching the title/summary: "{summary}"'
            if not summary:
                user_requirement = "that is the next upcoming event in the list (based on time)"

            prompt = f"""
            I have a list of calendar events:
            {event_list_str}
            
            The user wants to find an event {user_requirement}.
            
            Which event ID is the best match?
            Return ONLY a JSON object with the "id" of the matching event, or null if no match found.
            Example: {{ "id": "12345" }}
            """
            
            # 3. Ask LLM
            print(f"🤔 Asking LLM to match '{summary}'...")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that matches events. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            content = json.loads(response.choices[0].message.content)
            matched_id = content.get("id")
            
            if matched_id:
                print(f"✅ LLM matched event ID: {matched_id}")
                for e in events:
                    if e['id'] == matched_id:
                        return e
            
            print("❌ No match found by LLM.")
            return None

        except Exception as e:
            print(f"❌ Search Error: {e}")
            return None

    def execute_action(self, command_data: dict, auth_token: str = None, dry_run: bool = False):
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
                self.service = service # Update local service reference for _find_event
                print("✅ Using provided User Token for Google Calendar")
            except Exception as e:
                print(f"⚠️ Invalid User Token: {e}")
                return {"status": "error", "message": "Google Login ungültig. Bitte neu anmelden."}

        # Simulation mode if no service
        if not service:
            if dry_run:
                 return {"status": "confirmation_required", "message": f"[SIMULATION] Soll ich '{intent}' wirklich ausführen?", "data": event_data}
            
            if intent == "create_event":
                return {
                    "status": "success", 
                    "message": f"[SIMULATION] Termin erstellt: {event_data.get('summary')}",
                    "data": event_data
                }
            return {"status": "error", "message": "Google Calendar not authenticated (Simulation Mode)."}

        try:
            # DRY RUN CHECK
            if dry_run:
                if intent == "create_event":
                    return {
                        "status": "confirmation_required", 
                        "message": f"Ich werde den Termin '{event_data.get('summary')}' erstellen. Einverstanden?",
                        "data": event_data
                    }
                elif intent == "delete_event":
                    if event_data.get('delete_all'):
                         # Batch delete dry run
                         time_min = event_data.get('timeMin')
                         time_max = event_data.get('timeMax')
                         if not time_min: time_min = datetime.datetime.now().astimezone().isoformat()
                         
                         events_result = self.service.events().list(
                             calendarId='primary', timeMin=time_min, timeMax=time_max, singleEvents=True
                         ).execute()
                         events = events_result.get('items', [])
                         
                         if not events:
                             return {"status": "error", "message": "Ich habe keine Termine in diesem Zeitraum gefunden."}
                             
                         return {
                             "status": "confirmation_required",
                             "message": f"ACHTUNG: Ich werde ALLE {len(events)} Termine zwischen {time_min} und {time_max} löschen. Wirklich ausführen?",
                             "data": event_data
                         }

                    target_event = self._find_event(event_data.get('summary'), event_data.get('timeMin'))
                    if target_event:
                        return {
                            "status": "confirmation_required",
                            "message": f"Ich werde den Termin '{target_event.get('summary')}' ({target_event.get('start').get('dateTime')}) löschen. Einverstanden?",
                            "data": event_data
                        }
                    return {"status": "error", "message": f"Konnte Termin '{event_data.get('summary')}' nicht finden."}
                elif intent == "update_event":
                    target_event = self._find_event(event_data.get('summary'), event_data.get('timeMin'))
                    if target_event:
                         return {
                            "status": "confirmation_required",
                            "message": f"Ich werde den Termin '{target_event.get('summary')}' aktualisieren. Einverstanden?",
                            "data": event_data
                        }
                    return {"status": "error", "message": f"Konnte Termin '{event_data.get('summary')}' nicht finden."}
                
                return {"status": "success", "message": "Befehl verstanden (Dry Run)."}

            # EXECUTION
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
            
            elif intent == "delete_event":
                if event_data.get('delete_all'):
                     # Batch delete execution
                     time_min = event_data.get('timeMin')
                     time_max = event_data.get('timeMax')
                     if not time_min: time_min = datetime.datetime.now().astimezone().isoformat()

                     events_result = service.events().list(
                         calendarId='primary', timeMin=time_min, timeMax=time_max, singleEvents=True
                     ).execute()
                     events = events_result.get('items', [])
                     
                     count = 0
                     for e in events:
                         try:
                             service.events().delete(calendarId='primary', eventId=e['id']).execute()
                             count += 1
                         except Exception as del_err:
                             print(f"Error deleting event {e['id']}: {del_err}")
                             
                     return {"status": "success", "message": f"Es wurden {count} Termine gelöscht."}

                target_event = self._find_event(event_data.get('summary'), event_data.get('timeMin'))
                if target_event:
                    service.events().delete(calendarId='primary', eventId=target_event['id']).execute()
                    return {"status": "success", "message": f"Termin '{target_event.get('summary')}' wurde gelöscht."}
                return {"status": "error", "message": f"Konnte Termin '{event_data.get('summary')}' nicht finden."}

            elif intent == "update_event":
                target_event = self._find_event(event_data.get('summary'), event_data.get('timeMin'))
                if target_event:
                    # Merge new data
                    updated_event = {**target_event, **event_data}
                    # Remove fields that shouldn't be patched directly if necessary, but basic merge works for summary/desc
                    # Cleanup timeMin if it leaked into event_data
                    if 'timeMin' in updated_event: del updated_event['timeMin']
                    
                    service.events().patch(calendarId='primary', eventId=target_event['id'], body=updated_event).execute()
                    return {"status": "success", "message": f"Termin '{target_event.get('summary')}' wurde aktualisiert."}
                return {"status": "error", "message": f"Konnte Termin '{event_data.get('summary')}' nicht finden."}

            elif intent == "list_events":
                # ... (existing list logic)
                time_min = event_data.get('timeMin')
                if not time_min:
                    time_min = datetime.datetime.now().astimezone().isoformat()
                
                if 'T' in time_min and not ('Z' in time_min or '+' in time_min[-6:] or '-' in time_min[-6:]):
                     time_min = time_min + 'Z'

                print(f"📅 Fetching events from {time_min}...")
                events_result = service.events().list(
                    calendarId='primary', 
                    timeMin=time_min,
                    maxResults=10, 
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()
                events = events_result.get('items', [])
                
                return {
                    "status": "success",
                    "message": f"Ich habe {len(events)} Termine gefunden.",
                    "data": events,
                    "intent": "list_events"
                }

            elif intent == "unknown":
                return {"status": "error", "message": "Ich habe den Befehl nicht verstanden."}
            
            else:
                return {"status": "error", "message": f"Intent '{intent}' ist noch nicht implementiert."}

        except Exception as e:
            print(f"❌ Calendar API Error: {e}")
            return {"status": "error", "message": str(e)}

    def process(self, text: str, auth_token: str = None, dry_run: bool = False):
        """Main entry point: Interpret -> Execute"""
        print(f"🤖 Processing command: {text}")
        
        # 1. Interpret
        interpretation = self.interpret_command(text)
        print(f"🧠 Interpretation: {json.dumps(interpretation, indent=2)}")
        
        if interpretation.get("intent") == "error":
            return {"status": "error", "message": interpretation.get("message")}

        # 2. Execute
        result = self.execute_action(interpretation, auth_token, dry_run)
        return result
