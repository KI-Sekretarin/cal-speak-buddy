
-- Enable RLS on ai_responses (if not already)
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to delete responses linked to their inquiries
CREATE POLICY "Users can delete own responses"
ON ai_responses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM inquiries
    WHERE inquiries.id = ai_responses.inquiry_id
    AND inquiries.user_id = auth.uid()
  )
);
