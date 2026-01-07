-- Drop and recreate the view with SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.hello_logs_with_user;

CREATE VIEW public.hello_logs_with_user 
WITH (security_invoker = true)
AS
SELECT 
  hl.id,
  hl.user_id,
  p.email as user_email,
  p.username,
  hl.name,
  hl.hello_type,
  hl.notes,
  hl.rating,
  hl.difficulty_rating,
  hl.timezone_offset,
  hl.created_at as logged_at
FROM public.hello_logs hl
LEFT JOIN public.profiles p ON hl.user_id = p.id
ORDER BY hl.created_at DESC;