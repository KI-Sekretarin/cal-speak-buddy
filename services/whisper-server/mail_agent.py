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
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        print(f"DEBUG: Loading env from {env_path}")
        load_dotenv(env_path)

        # Initialize Local LLM (Ollama)
        self.client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama" 
        )
        self.model_name = "qwen2.5:14b"
        
        # Initialize Supabase
        url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        print(f"DEBUG: Supabase URL: {url}")
        print(f"DEBUG: Supabase Key Exists: {bool(key)}")
        
        if not url or not key:
            print("⚠️ Supabase credentials missing/incomplete in .env")
            self.supabase = None
        else:
            self.supabase: Client = create_client(url, key)
            print("✅ Supabase Client initialized in MailAgent")

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
            results = service.users().messages().list(userId='me', q='is:unread', maxResults=10).execute()
            messages = results.get('messages', [])
            
            processed_count = 0
            skipped_count = 0
            
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
                
                # 3. Pre-Filter (Heuristic)
                if self._is_obviously_irrelevant(sender, subject, body):
                    print(f"🛑 Blocked by heuristic filters: {subject}")
                    # Mark as read to avoid rescanning
                    service.users().messages().modify(userId='me', id=msg['id'], body={'removeLabelIds': ['UNREAD']}).execute()
                    skipped_count += 1
                    continue

                # 4. Process with AI
                print(f"🤖 Analyzing email relevance: {subject}")
                ai_data = self._analyze_email(subject, body)
                
                if not ai_data.get("is_relevant", False):
                    print(f"⏭️ Skipping irrelevant email (AI decision): {subject} - Reason: {ai_data.get('reason')}")
                    # Still mark as read so we don't scan it again
                    service.users().messages().modify(userId='me', id=msg['id'], body={'removeLabelIds': ['UNREAD']}).execute()
                    skipped_count += 1
                    continue

                # 5. Save to Supabase
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
                
                # 6. Mark as read
                service.users().messages().modify(userId='me', id=msg['id'], body={'removeLabelIds': ['UNREAD']}).execute()
                processed_count += 1
                
            return {"status": "success", "count": processed_count, "skipped": skipped_count}

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

    def _is_obviously_irrelevant(self, sender, subject, body):
        """Fast heuristic filter to block obvious junk before AI."""
        sender = sender.lower()
        subject = subject.lower()
        
        # Blocklist patterns
        blocked_senders = ['noreply', 'do-not-reply', 'newsletter', 'marketing', 'alert', 'notification', 'info@twitter', 'facebook', 'linkedin', 'instagram']
        blocked_keywords = ['verify your email', 'security alert', 'login attempted', 'unsubscribe', 'privacy policy update', 'terms of service', 'receipt', 'invoice', 'payment successful', 'bestellung bestätigt']
        
        if any(s in sender for s in blocked_senders):
            return True
        if any(k in subject for k in blocked_keywords):
            return True
            
        return False

    def _analyze_email(self, subject, body):
        """Uses Ollama to extract category and relevance."""
        prompt = f"""
        Strictly analyze this email for a business secretary inbox.
        
        Subject: {subject}
        Body (Excerpt): {body[:1500]}
        
        Your Job:
        Filter out EVERYTHING that is not a direct human inquiry requiring a response.
        
        Mark "is_relevant": false IF:
        - Newsletters, automated notifications, system alerts.
        - Receipts, invoices, payment confirmations.
        - Marketing, spam, cold sales.
        - LinkedIn/Social Media notifications.
        
        Mark "is_relevant": true ONLY IF:
        - Real person asking a question.
        - Request for appointment/booking.
        - Complaint or direct feedback.
        
        Return JSON ONLY:
        {{
            "is_relevant": true/false,
            "category": "general" | "appointment" | "technical" | "billing" | "complaint",
            "reason": "short explanation"
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
            # FALBACK: Deny by default on error to prevent spam flood
            return {"is_relevant": False, "category": "spam", "reason": "AI extraction failed"}

