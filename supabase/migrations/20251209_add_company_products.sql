-- Create table for products and services with fixed prices
create table if not exists public.company_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) check (price >= 0),
  currency text default 'EUR',
  type text check (type in ('product', 'service')) default 'service',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.company_products enable row level security;

-- Policies
create policy "Users can view their own products"
  on public.company_products for select
  using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on public.company_products for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on public.company_products for update
  using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on public.company_products for delete
  using (auth.uid() = user_id);

-- Trigger for timestamps
create trigger update_company_products_updated_at
  before update on public.company_products
  for each row
  execute function public.update_updated_at_column();

-- Update AI Context View to include products/services with prices
drop view if exists public.ai_company_context;
create or replace view public.ai_company_context as
select 
  p.id,
  p.company_name,
  p.industry,
  p.company_description,
  p.services_offered, -- Keep for backwards compatibility
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

comment on view public.ai_company_context is 'Optimized view for AI integration including products and services with prices';
