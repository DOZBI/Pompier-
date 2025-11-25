-- Create storage bucket for house plans
INSERT INTO storage.buckets (id, name, public)
VALUES ('house-plans', 'house-plans', false);

-- Create RLS policies for house plans bucket
CREATE POLICY "Users can upload their own house plans"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'house-plans' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own house plans"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'house-plans' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all house plans"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'house-plans' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete their own house plans"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'house-plans' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add plan analysis fields to houses table
ALTER TABLE houses 
ADD COLUMN plan_url TEXT,
ADD COLUMN plan_analysis JSONB;