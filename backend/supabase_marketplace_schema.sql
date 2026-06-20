-- Supabase SQL Schema for Seller AgriMarketplace

-- ==========================================
-- 0. UPDATE EXISTING USERS TABLE (If needed)
-- ==========================================
-- Since your 'users' table already exists, we do NOT recreate it.
-- However, if your 'users' table has a strict constraint that only allows 'farmer' and 'buyer',
-- you will need to drop that constraint and add a new one that allows 'seller'.
-- We are dropping the old constraint (usually named users_user_type_check) 
-- and replacing it with one that includes 'seller'.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('farmer', 'buyer', 'seller'));


-- ==========================================
-- 1. CREATE SELLER PRODUCTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS seller_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for seller_products
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products (so farmers can see them in the marketplace)
DROP POLICY IF EXISTS "Public can view products" ON seller_products;
CREATE POLICY "Public can view products" 
  ON seller_products FOR SELECT 
  USING (true);

-- Allow only the seller who created the product to update or delete it
DROP POLICY IF EXISTS "Sellers can manage their own products" ON seller_products;
CREATE POLICY "Sellers can manage their own products" 
  ON seller_products FOR ALL 
  USING (auth.uid() = seller_id);


-- ==========================================
-- 2. CREATE SELLER ORDERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS seller_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES seller_products(id) ON DELETE RESTRICT,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for seller_orders
ALTER TABLE seller_orders ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own orders
DROP POLICY IF EXISTS "Farmers can view their own orders" ON seller_orders;
CREATE POLICY "Farmers can view their own orders" 
  ON seller_orders FOR SELECT 
  USING (auth.uid() = farmer_id);

-- Farmers can create orders
DROP POLICY IF EXISTS "Farmers can place orders" ON seller_orders;
CREATE POLICY "Farmers can place orders" 
  ON seller_orders FOR INSERT 
  WITH CHECK (auth.uid() = farmer_id);

-- Sellers can view orders placed for their products
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON seller_orders;
CREATE POLICY "Sellers can view orders for their products" 
  ON seller_orders FOR SELECT 
  USING (auth.uid() = seller_id);

-- Sellers can update the status of their orders
DROP POLICY IF EXISTS "Sellers can update order status" ON seller_orders;
CREATE POLICY "Sellers can update order status" 
  ON seller_orders FOR UPDATE 
  USING (auth.uid() = seller_id);


-- ==========================================
-- 3. CREATE STORAGE BUCKET FOR PRODUCT IMAGES
-- ==========================================
-- Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('seller_product_images', 'seller_product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for seller_product_images bucket
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'seller_product_images');

DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Auth Upload Access" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'seller_product_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Access" ON storage.objects;
CREATE POLICY "Auth Delete Access" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'seller_product_images' AND auth.uid() = owner);
