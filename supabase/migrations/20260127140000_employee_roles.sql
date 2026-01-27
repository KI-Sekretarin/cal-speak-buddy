
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view their own employees"
  ON public.employee_profiles FOR SELECT
  USING ( auth.uid() = employer_id );

CREATE POLICY "Employers can update their own employees"
  ON public.employee_profiles FOR UPDATE
  USING ( auth.uid() = employer_id );

CREATE POLICY "Employers can delete their own employees"
  ON public.employee_profiles FOR DELETE
  USING ( auth.uid() = employer_id );

CREATE POLICY "Employees can view themselves"
  ON public.employee_profiles FOR SELECT
  USING ( auth.uid() = id );

-- Policy for inquiries table (referenced in next migration)
CREATE POLICY "Employees can view inquiries matching their role"
  ON public.inquiries FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.employee_profiles
      WHERE role::text = inquiries.category::text
    )
  );
