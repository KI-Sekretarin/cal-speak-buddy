// Extended Profile Types for Company Information

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
export type PreferredTone = 'formal' | 'professional' | 'casual' | 'friendly';

export interface SocialMedia {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  xing?: string;
  youtube?: string;
  tiktok?: string;
}

export interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export interface CompanyProfile {
  // Basic Info
  id: string;
  full_name?: string;
  company_name?: string;
  
  // Company Details
  industry?: string;
  company_size?: CompanySize;
  founded_year?: number;
  tax_id?: string;
  registration_number?: string;
  
  // Contact Information
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  website?: string;
  social_media?: SocialMedia;
  
  // Address
  street?: string;
  street_number?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Business Hours
  business_hours?: BusinessHours;
  
  // AI Context
  company_description?: string;
  services_offered?: string[];
  target_audience?: string;
  company_values?: string[];
  unique_selling_points?: string[];
  
  // Communication Preferences
  preferred_tone?: PreferredTone;
  preferred_language?: string;
  response_template_intro?: string;
  response_template_signature?: string;
  
  // FAQ & Categories
  common_faqs?: FAQ[];
  inquiry_categories?: string[];
  
  // AI Instructions
  ai_instructions?: string;
  auto_response_enabled?: boolean;
  auto_categorization_enabled?: boolean;
  
  // Additional Features
  certifications?: string[];
  languages_supported?: string[];
  payment_methods?: string[];
  delivery_areas?: string[];
  important_notes?: string;
  
  // Branding
  logo_url?: string;
  brand_colors?: BrandColors;
  
  // Meta
  profile_completed?: boolean;
  last_profile_update?: string;
  created_at?: string;
  updated_at?: string;
  
  // Contact Form
  contact_form_slug?: string;
  contact_form_title?: string;
  contact_form_description?: string;
}

export interface AICompanyContext {
  id: string;
  company_name?: string;
  industry?: string;
  company_description?: string;
  services_offered?: string[];
  target_audience?: string;
  company_values?: string[];
  unique_selling_points?: string[];
  preferred_tone?: PreferredTone;
  preferred_language?: string;
  response_template_intro?: string;
  response_template_signature?: string;
  common_faqs?: FAQ[];
  inquiry_categories?: string[];
  ai_instructions?: string;
  business_hours?: BusinessHours;
  phone?: string;
  email?: string;
  website?: string;
  auto_response_enabled?: boolean;
  auto_categorization_enabled?: boolean;
}
