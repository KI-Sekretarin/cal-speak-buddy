
-- Add assignment fields to inquiries
ALTER TABLE public.inquiries
ADD COLUMN assigned_to UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL;

-- Add skills and capacity to employee_profiles
ALTER TABLE public.employee_profiles
ADD COLUMN skills TEXT[] DEFAULT '{}',
ADD COLUMN max_capacity INTEGER DEFAULT 10;

-- Update RLS for inquiries to allow employees to see tickets assigned to them
-- We need to drop the old policy first or create a new inclusive one.
-- Let's update the existing policy "Employees can view inquiries matching their role" to also include assigned tickets

DROP POLICY IF EXISTS "Employees can view inquiries matching their role" ON public.inquiries;

CREATE POLICY "Employees can view assigned or role-matching inquiries"
ON public.inquiries
FOR SELECT
USING (
  (auth.uid() IN (
    SELECT id FROM public.employee_profiles 
    WHERE role::text = inquiries.category::text
  ))
  OR 
  (auth.uid() IN ( 
    SELECT id FROM public.employee_profiles 
    WHERE id = inquiries.assigned_to 
  ))
);
