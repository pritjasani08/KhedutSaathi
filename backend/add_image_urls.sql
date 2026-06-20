-- Add image_urls column to support multiple images
ALTER TABLE seller_products ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
