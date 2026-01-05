-- Remove services_offered from the view to rely solely on company_products (Sortiment)
drop view if exists public.ai_company_context;
create or replace view public.ai_company_context as
select 
  p.id,
  p.company_name,
  p.industry,
  p.company_description,
  -- Removed services_offered
  (
    select jsonb_agg(jsonb_build_object(
      'name', cp.name, 
      'description', cp.description, 
      'price', cp.price, 
      'currency', cp.currency,
      'type', cp.type
    ))
    from public.company_products cp
    where cp.user_id = p.id
  ) as products_and_services,
  p.target_audience,
  p.company_values,
  p.unique_selling_points,
  p.preferred_tone,
  p.preferred_language,
  p.response_template_intro,
  p.response_template_signature,
  p.common_faqs,
  p.inquiry_categories,
  p.ai_instructions,
  p.business_hours,
  p.phone,
  p.email,
  p.website,
  p.auto_response_enabled,
  p.auto_categorization_enabled
from public.profiles p
where p.profile_completed = true;

comment on view public.ai_company_context is 'Optimized view for AI integration. Legacy services_offered removed in favor of products_and_services.';
