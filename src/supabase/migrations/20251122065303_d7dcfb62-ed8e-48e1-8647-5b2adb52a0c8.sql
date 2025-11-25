-- Create reports table for automated report generation
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  report_data jsonb NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Admin can view all reports
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can create reports
CREATE POLICY "Admins can create reports"
ON public.reports
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete reports
CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_reports_report_type ON public.reports(report_type);
CREATE INDEX idx_reports_period ON public.reports(period_start, period_end);
CREATE INDEX idx_reports_generated_at ON public.reports(generated_at DESC);