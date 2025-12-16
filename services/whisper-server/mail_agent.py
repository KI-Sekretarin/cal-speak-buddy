import os
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from openai import OpenAI
import json
from supabase import create_client, Client
from email.utils import parseaddr

from dotenv import load_dotenv

class MailAgent:
    def __init__(self):
        # Load env explicitly
        load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

        # Initialize Local LLM (Ollama)
        self.client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama" 
        )
        self.model_name = "llama3.2"
        
        # Initialize Supabase
        url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print("⚠️ Supabase credentials missing/incomplete in .env")
            self.supabase = None
        else:
            self.supabase: Client = create_client(url, key)

    def scan_and_process(self, auth_token: str, user_id: str):
        """
        Scans unread emails and converts them to tickets.
        """
        if not self.supabase:
            return {"status": "error", "message": "Server Config Error: Supabase connection missing."}

        try:
            # 1. Authenticate with Google
            creds = Credentials(token=auth_token)
            service = build('gmail', 'v1', credentials=creds)
            
            # 2. Fetch unread emails
            print("🔍 Scanning for unread emails...")
            results = service.users().messages().list(userId='me', q='is:unread', maxResults=5).execute()
            messages = results.get('messages', [])
            
            processed_count = 0
            
            if not messages:
                return {"status": "success", "count": 0, "message": "No unread emails found."}

            for msg in messages:
                # Get full message details
                message = service.users().messages().get(userId='me', id=msg['id']).execute()
                payload = message['payload']
                headers = payload.get('headers', [])
                
                # Extract headers
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                sender_name, sender_email = parseaddr(sender)
                
                # Extract body
                body = self._get_email_body(payload)
                
                # 3. Process with AI
                print(f"🤖 Processing email: {subject}")
                ai_data = self._analyze_email(subject, body)
                
                # 4. Save to Supabase
                data = {
                    "user_id": user_id,
                    "name": sender_name or "Email User",
                    "email": sender_email,
                    "subject": subject,
                    "message": f"[Via Email]\n{body}",
                    "category": ai_data.get("category", "general"),
                    "status": "open",
                    "source": "email"
                }

                print(f"📝 Inserting into Supabase: {subject}")
                self.supabase.table("inquiries").insert(data).execute()
                print("✅ Insert successful")
                
                # 5. Mark as read
                service.users().messages().modify(userId='me', id=msg['id'], body={'removeLabelIds': ['UNREAD']}).execute()
                processed_count += 1
                
            return {"status": "success", "count": processed_count}

        except Exception as e:
            print(f"❌ Mail Processing Error: {e}")
            return {"status": "error", "message": str(e)}

    def _get_email_body(self, payload):
        """Recursively extract email body from payload."""
        body = ""
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        body += base64.urlsafe_b64decode(part['body']['data']).decode()
                elif part['mimeType'] == 'multipart/alternative':
                    body += self._get_email_body(part)
        elif 'body' in payload and 'data' in payload['body']:
             body += base64.urlsafe_b64decode(payload['body']['data']).decode()
        return body

    def _analyze_email(self, subject, body):
        """Uses Ollama to extract category and summary."""
        prompt = f"""
        Analyze this email for a customer support ticket.
        
        Subject: {subject}
        Body: {body}
        
        Task:
        1. Categorize into: 'general', 'technical', 'billing', 'feedback', 'urgent'.
        2. Summarize the core issue in 1 sentence.
        
        Return JSON ONLY:
        {{
            "category": "category_name",
            "summary": "..."
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"AI Error: {e}")
            return {"category": "general", "summary": "AI extraction failed"}
