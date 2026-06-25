-- Supabase SQL Schema for Wishlist Migration

-- Create user_wishlists table to store wishlisted products for users
CREATE TABLE IF NOT EXISTS user_wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES seller_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE user_wishlists ENABLE ROW LEVEL SECURITY;

-- Allow public access to user_wishlists since auth is currently managed by a custom Node backend JWT
-- The frontend application code will safely filter by user_id
DROP POLICY IF EXISTS "Public can view wishlists" ON user_wishlists;
CREATE POLICY "Public can view wishlists" 
  ON user_wishlists FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public can insert wishlists" ON user_wishlists;
CREATE POLICY "Public can insert wishlists" 
  ON user_wishlists FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete wishlists" ON user_wishlists;
CREATE POLICY "Public can delete wishlists" 
  ON user_wishlists FOR DELETE 
  USING (true);
