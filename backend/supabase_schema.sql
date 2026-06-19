-- Supabase SQL Schema for Sell Your Yield Marketplace

-- 1. Create crop_listings table
CREATE TABLE crop_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crop_name VARCHAR(255) NOT NULL,
  quantity_quintals NUMERIC NOT NULL,
  expected_price NUMERIC NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SOLD')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create crop_images table
CREATE TABLE crop_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create bids table
CREATE TABLE bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bid_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create accepted_bids table (Deal record)
CREATE TABLE accepted_bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  final_price NUMERIC NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Set up Storage Bucket for crop images
-- Note: You can also create this bucket manually in the Supabase Dashboard under Storage.
INSERT INTO storage.buckets (id, name, public) VALUES ('crop_images', 'crop_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for crop_images bucket
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'crop_images');

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'crop_images' AND auth.role() = 'authenticated');
