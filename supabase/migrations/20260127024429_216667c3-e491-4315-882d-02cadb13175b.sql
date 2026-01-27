-- Add linked_to column to hello_logs for duplicate detection
-- When a user confirms a new entry is the same person, we link it to the original entry
ALTER TABLE public.hello_logs 
ADD COLUMN IF NOT EXISTS linked_to UUID REFERENCES public.hello_logs(id) ON DELETE SET NULL;

-- Create index for efficient lookup of linked entries
CREATE INDEX IF NOT EXISTS idx_hello_logs_linked_to ON public.hello_logs(linked_to);

-- Add a comment explaining the purpose
COMMENT ON COLUMN public.hello_logs.linked_to IS 'References the original hello_log entry if this is a repeat encounter with the same person';