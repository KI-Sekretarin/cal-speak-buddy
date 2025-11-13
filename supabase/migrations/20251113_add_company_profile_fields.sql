-- Migration: Add comprehensive company profile fields for AI context
-- This extends the profiles table with detailed company information
-- that will be used for AI-powered inquiry categorization and response generation

-- Add company information fields
ALTER TABLE public.profiles
  -- Basic company info
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS company_size text CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  ADD COLUMN IF NOT EXISTS founded_year integer CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  ADD COLUMN IF NOT EXISTS tax_id text, -- USt-IdNr / UID
  ADD COLUMN IF NOT EXISTS registration_number text, -- Firmenbuchnummer
  
  -- Contact details
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS mobile text,
  ADD COLUMN IF NOT EXISTS fax text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS website text,
  
  -- Social Media
  ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb,
  -- Example: {"linkedin": "company-name", "facebook": "page-name", "instagram": "handle", "twitter": "handle"}
  
  -- Address information
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS street_number text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text, -- Bundesland
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Österreich',
  
  -- Business hours
  ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{}'::jsonb,
  -- Example: {"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {...}, ...}
  
  -- AI Context fields - WICHTIG für N8N KI-Antworten
  ADD COLUMN IF NOT EXISTS company_description text,
  ADD COLUMN IF NOT EXISTS services_offered jsonb DEFAULT '[]'::jsonb,
  -- Example: ["Web Development", "Mobile Apps", "Consulting"]
  
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS company_values jsonb DEFAULT '[]'::jsonb,
  -- Example: ["Innovation", "Qualität", "Nachhaltigkeit"]
  
  ADD COLUMN IF NOT EXISTS unique_selling_points jsonb DEFAULT '[]'::jsonb,
  -- Example: ["20+ Jahre Erfahrung", "100% Made in Austria"]
  
  -- Communication preferences for AI
  ADD COLUMN IF NOT EXISTS preferred_tone text CHECK (preferred_tone IN ('formal', 'professional', 'casual', 'friendly')) DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'de',
  ADD COLUMN IF NOT EXISTS response_template_intro text,
  ADD COLUMN IF NOT EXISTS response_template_signature text,
  
  -- FAQ and common inquiries
  ADD COLUMN IF NOT EXISTS common_faqs jsonb DEFAULT '[]'::jsonb,
  -- Example: [{"question": "Was kostet...?", "answer": "Unsere Preise..."}]
  
  ADD COLUMN IF NOT EXISTS inquiry_categories jsonb DEFAULT '[]'::jsonb,
  -- Example: ["Produktanfrage", "Support", "Bestellung", "Beschwerde"]
  
  -- Special instructions for AI
  ADD COLUMN IF NOT EXISTS ai_instructions text,
  -- Example: "Immer Duzen verwenden, Links zur Dokumentation einfügen"
  
  ADD COLUMN IF NOT EXISTS auto_response_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_categorization_enabled boolean DEFAULT true,
  
  -- Additional features
  ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
  -- Example: ["ISO 9001", "ÖCERT"]
  
  ADD COLUMN IF NOT EXISTS languages_supported jsonb DEFAULT '["de"]'::jsonb,
  -- Example: ["de", "en", "fr"]
  
  ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '[]'::jsonb,
  -- Example: ["Rechnung", "Kreditkarte", "PayPal", "Vorkasse"]
  
  ADD COLUMN IF NOT EXISTS delivery_areas jsonb DEFAULT '[]'::jsonb,
  -- Example: ["Österreich", "Deutschland", "Schweiz"]
  
  ADD COLUMN IF NOT EXISTS important_notes text,
  -- Wichtige Hinweise für die KI (z.B. "Keine Lieferung an Postfächer")
  
  -- Logo and branding
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS brand_colors jsonb DEFAULT '{}'::jsonb,
  -- Example: {"primary": "#007bff", "secondary": "#6c757d"}
  
  -- Meta
  ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone DEFAULT now();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(contact_form_slug);

-- Update the updated_at trigger to also update last_profile_update
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_profile_update = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_timestamp();

-- Add helpful comments
COMMENT ON COLUMN public.profiles.company_description IS 'Kurzbeschreibung der Firma für KI-Kontext (100-500 Wörter empfohlen)';
COMMENT ON COLUMN public.profiles.ai_instructions IS 'Spezielle Anweisungen für die KI bei der Antworterstellung';
COMMENT ON COLUMN public.profiles.services_offered IS 'Array von Hauptleistungen/Produkten';
COMMENT ON COLUMN public.profiles.inquiry_categories IS 'Benutzerdefinierte Kategorien für Anfragen';
COMMENT ON COLUMN public.profiles.preferred_tone IS 'Bevorzugter Kommunikationsstil: formal, professional, casual, friendly';
COMMENT ON COLUMN public.profiles.business_hours IS 'Öffnungszeiten als JSON-Objekt mit Wochentagen';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Create a helper view for AI context
CREATE OR REPLACE VIEW public.ai_company_context AS
SELECT 
  id,
  company_name,
  industry,
  company_description,
  services_offered,
  target_audience,
  company_values,
  unique_selling_points,
  preferred_tone,
  preferred_language,
  response_template_intro,
  response_template_signature,
  common_faqs,
  inquiry_categories,
  ai_instructions,
  business_hours,
  phone,
  email,
  website,
  auto_response_enabled,
  auto_categorization_enabled
FROM public.profiles
WHERE profile_completed = true;

COMMENT ON VIEW public.ai_company_context IS 'Optimierte Ansicht für N8N AI-Integration mit allen relevanten Kontextdaten';

-- Grant access to the view
GRANT SELECT ON public.ai_company_context TO authenticated;
