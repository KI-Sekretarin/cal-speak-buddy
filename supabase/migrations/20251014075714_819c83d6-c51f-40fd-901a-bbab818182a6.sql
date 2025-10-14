-- Create enum for inquiry status
CREATE TYPE public.inquiry_status AS ENUM ('open', 'in_progress', 'closed');

-- Create enum for inquiry category
CREATE TYPE public.inquiry_category AS ENUM ('general', 'technical', 'billing', 'feedback', 'other');

-- Create inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category public.inquiry_category NOT NULL DEFAULT 'general',
  status public.inquiry_status NOT NULL DEFAULT 'open',
  ai_category TEXT,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_responses table
CREATE TABLE public.ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE NOT NULL,
  suggested_response TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiries
CREATE POLICY "Anyone can create inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view inquiries"
  ON public.inquiries
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (true);

-- RLS Policies for ai_responses
CREATE POLICY "Anyone can create ai_responses"
  ON public.ai_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view ai_responses"
  ON public.ai_responses
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update ai_responses"
  ON public.ai_responses
  FOR UPDATE
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();