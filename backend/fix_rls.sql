-- Disable RLS so your custom backend can interact freely
ALTER TABLE seller_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE seller_orders DISABLE ROW LEVEL SECURITY;

-- Allow anonymous uploads since we are using custom auth instead of Supabase Auth
DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Public Upload Access" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'seller_product_images');
