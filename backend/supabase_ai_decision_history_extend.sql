ALTER TABLE public.ai_decisions 
ADD COLUMN IF NOT EXISTS actual_crop_planted TEXT,
ADD COLUMN IF NOT EXISTS actual_yield NUMERIC;
