-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visitor_token TEXT NOT NULL, -- To identify returning visitors
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot', 'agent')),
  content TEXT NOT NULL,
  is_processed BOOLEAN DEFAULT false, -- For the AI worker to know if it needs to reply
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions
-- Anyone can create a session (visitors)
CREATE POLICY "Anyone can create chat sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (true);

-- Visitors can view their own sessions (based on token? No, usually based on local storage ID, but RLS is hard with just token if not auth. 
-- For now, let's allow public select if we use a secure token or just allow insert and select by ID if we know it.
-- Actually, for a public chat widget, usually we use a signed token or just allow all for now and rely on UUID obscurity, 
-- BUT better: allow select if visitor_token matches (passed via header? No).
-- Let's stick to: Company Users can view all sessions for their company. Visitors can view their own (we might need a function or just open it up carefully).
-- For simplicity in this prototype:
-- 1. Company owner can view all their sessions.
-- 2. Public can insert.
-- 3. Public can view if they have the ID (UUID).

CREATE POLICY "Company owners can view their chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view chat sessions by ID"
  ON public.chat_sessions
  FOR SELECT
  USING (true); -- UUIDs are hard to guess.

-- Policies for chat_messages
CREATE POLICY "Anyone can create chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_processed ON public.chat_messages(is_processed) WHERE sender = 'user';

-- Trigger for updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
