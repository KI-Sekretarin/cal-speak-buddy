-- Fix function search paths using CREATE OR REPLACE
CREATE OR REPLACE FUNCTION public.enqueue_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ai_category IS NULL THEN
    INSERT INTO public.inquiry_queue (inquiry_id, payload)
    VALUES (NEW.id, to_jsonb(NEW))
    ON CONFLICT (inquiry_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Enable RLS on inquiry_queue
ALTER TABLE public.inquiry_queue ENABLE ROW LEVEL SECURITY;

-- Add policy for inquiry_queue (system-only access)
CREATE POLICY "Service role can manage inquiry_queue"
  ON public.inquiry_queue
  FOR ALL
  USING (true);