-- 1. Add Chat Settings to Profiles (Context & Customization)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS chat_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS chat_welcome_message text DEFAULT 'Hallo! Wie kann ich Ihnen heute helfen?',
ADD COLUMN IF NOT EXISTS chat_primary_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS chat_suggested_questions jsonb DEFAULT '["Was sind Ihre Öffnungszeiten?", "Wo befinden Sie sich?"]'::jsonb;

-- 2. Create Chat Sessions Table (Tracks the conversation)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The company this chat belongs to
  visitor_token text NOT NULL, -- Anonymous token to identify the visitor
  visitor_name text, -- Can be updated if user provides it
  visitor_email text, -- Can be updated if user provides it
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb -- For IP, User Agent, Referrer, etc.
);

-- 3. Create Chat Messages Table (Individual messages)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'bot', 'agent')),
  content text NOT NULL,
  is_processed boolean DEFAULT false, -- Flag for AI worker to pick up
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb -- For attachments, reactions, etc.
);

-- 4. Update Inquiries to link with Chat (Integration with Ticket System)
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS source text DEFAULT 'contact_form', -- 'contact_form', 'chat', 'email'
ADD COLUMN IF NOT EXISTS chat_session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL;

-- 5. Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Chat Sessions:
-- Anyone can create a session (visitors)
CREATE POLICY "Public can create chat sessions" 
ON public.chat_sessions FOR INSERT 
WITH CHECK (true);

-- Visitors can view their own sessions (We use a loose policy here for simplicity in public widget, 
-- ideally you'd match visitor_token via a secure function or header, but for now allow SELECT by ID/Token logic in app)
CREATE POLICY "Public can view chat sessions" 
ON public.chat_sessions FOR SELECT 
USING (true);

-- Companies can view/update ONLY their own sessions
CREATE POLICY "Companies can view their sessions" 
ON public.chat_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Companies can update their sessions" 
ON public.chat_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Chat Messages:
-- Anyone can create messages (visitors)
CREATE POLICY "Public can create messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (true);

-- Public can view messages (for the widget)
CREATE POLICY "Public can view messages" 
ON public.chat_messages FOR SELECT 
USING (true);

-- Companies can view messages belonging to their sessions
CREATE POLICY "Companies can view their session messages" 
ON public.chat_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions 
    WHERE id = chat_messages.session_id 
    AND user_id = auth.uid()
  )
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor_token ON public.chat_sessions(visitor_token);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_chat_session_id ON public.inquiries(chat_session_id);

-- 8. Triggers
-- Update updated_at on chat_sessions
CREATE OR REPLACE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update last_message_at on chat_sessions when a new message is added
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET last_message_at = now(), updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_chat_session_timestamp_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_session_timestamp();
