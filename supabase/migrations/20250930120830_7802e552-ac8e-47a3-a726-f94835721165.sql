-- Clean start: Drop existing tables to start fresh
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS public.ticket_category CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.meeting_status CASCADE;

-- Create fresh enums for meeting status
CREATE TYPE public.meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create meetings table for calendar management
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attendees JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  status meeting_status DEFAULT 'scheduled',
  created_by TEXT, -- For tracking who created the meeting
  google_calendar_id TEXT, -- For Google Calendar integration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for meetings - allowing all operations for now (no auth required initially)
CREATE POLICY "Allow all operations on meetings for now" 
ON public.meetings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create activity logs table for tracking voice commands and actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  voice_command TEXT, -- Store the original voice command
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for activity logs
CREATE POLICY "Allow all operations on activity_logs" 
ON public.activity_logs 
FOR ALL 
USING (true);

-- Insert some sample meetings for testing
INSERT INTO public.meetings (title, description, start_time, end_time, attendees, location, created_by) VALUES
('Meeting mit Frau Huber', 'Projektbesprechung für das neue System', '2024-10-01 10:00:00+02', '2024-10-01 11:00:00+02', '[{"name": "Frau Huber", "email": "huber@example.com"}]', 'Konferenzraum A', 'Sprachassistent'),
('Team Meeting', 'Wöchentliche Besprechung', '2024-10-02 14:00:00+02', '2024-10-02 15:00:00+02', '[{"name": "Team Lead", "email": "lead@company.com"}]', 'Büro 123', 'Sprachassistent'),
('Kundentermin', 'Produktvorstellung', '2024-10-03 09:00:00+02', '2024-10-03 10:30:00+02', '[{"name": "Kunde", "email": "kunde@firma.de"}]', 'Online', 'Sprachassistent');