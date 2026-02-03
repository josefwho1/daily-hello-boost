-- Create auth_codes table for storing temporary verification codes
CREATE TABLE public.auth_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by email
CREATE INDEX idx_auth_codes_email ON public.auth_codes(email);

-- Create index for cleanup of expired codes
CREATE INDEX idx_auth_codes_expires_at ON public.auth_codes(expires_at);

-- Enable RLS (but allow public access since this is pre-auth)
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from edge functions (service role)
-- No direct client access - all operations go through edge functions
CREATE POLICY "Service role can manage auth codes" 
ON public.auth_codes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to clean up expired codes (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_codes 
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;