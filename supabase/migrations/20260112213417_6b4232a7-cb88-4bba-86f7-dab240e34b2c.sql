-- Enable RLS on the hello_logs_with_user view
ALTER VIEW public.hello_logs_with_user SET (security_invoker = true);

-- Note: Views with security_invoker=true inherit RLS from underlying tables
-- The hello_logs table already has proper RLS (auth.uid() = user_id)
-- So users can only see their own data through this view