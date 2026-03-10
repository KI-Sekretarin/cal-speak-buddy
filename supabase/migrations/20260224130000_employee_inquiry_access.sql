-- Migration: Allow employees to view, edit and send AI responses for inquiries
-- Employees can access inquiries that match their role or are assigned to them.
-- They also need INSERT/UPDATE/DELETE on ai_responses for those inquiries.

-- ============================================================
-- 1. Employees can UPDATE inquiries (e.g. change status)
-- ============================================================
CREATE POLICY "Employees can update assigned or role-matching inquiries"
ON public.inquiries
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT ep.id FROM public.employee_profiles ep
    WHERE ep.role::text = inquiries.category::text
       OR ep.id = inquiries.assigned_to
  )
);

-- ============================================================
-- 2. Employees can SELECT ai_responses for inquiries they can see
-- ============================================================
CREATE POLICY "Employees can view ai_responses for accessible inquiries"
ON public.ai_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    JOIN public.employee_profiles ep ON ep.id = auth.uid()
    WHERE i.id = ai_responses.inquiry_id
      AND (ep.role::text = i.category::text OR ep.id = i.assigned_to)
  )
);

-- ============================================================
-- 3. Employees can INSERT ai_responses for inquiries they can see
-- ============================================================
CREATE POLICY "Employees can create ai_responses for accessible inquiries"
ON public.ai_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    JOIN public.employee_profiles ep ON ep.id = auth.uid()
    WHERE i.id = ai_responses.inquiry_id
      AND (ep.role::text = i.category::text OR ep.id = i.assigned_to)
  )
);

-- ============================================================
-- 4. Employees can UPDATE ai_responses for inquiries they can see
-- ============================================================
CREATE POLICY "Employees can update ai_responses for accessible inquiries"
ON public.ai_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    JOIN public.employee_profiles ep ON ep.id = auth.uid()
    WHERE i.id = ai_responses.inquiry_id
      AND (ep.role::text = i.category::text OR ep.id = i.assigned_to)
  )
);

-- ============================================================
-- 5. Employees can DELETE ai_responses for inquiries they can see
-- ============================================================
CREATE POLICY "Employees can delete ai_responses for accessible inquiries"
ON public.ai_responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    JOIN public.employee_profiles ep ON ep.id = auth.uid()
    WHERE i.id = ai_responses.inquiry_id
      AND (ep.role::text = i.category::text OR ep.id = i.assigned_to)
  )
);
