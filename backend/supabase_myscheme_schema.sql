-- Supabase SQL Schema for MyScheme Integration

-- Enable pg_trgm for partial matching if not enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Create schemes table
CREATE TABLE IF NOT EXISTS schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(512) NOT NULL,
  description TEXT,
  state VARCHAR(255),
  department VARCHAR(255),
  category VARCHAR(255),
  level VARCHAR(50),
  tags TEXT[],
  official_url TEXT,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crop_keywords TEXT[],
  beneficiary_keywords TEXT[],
  search_vector tsvector
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_level ON schemes(level);
CREATE INDEX IF NOT EXISTS idx_schemes_search_vector ON schemes USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_schemes_slug ON schemes(slug);

-- 2. Create scheme_bookmarks table
CREATE TABLE IF NOT EXISTS scheme_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scheme_id)
);

-- 3. Create scheme_views table (for analytics/popularity)
CREATE TABLE IF NOT EXISTS scheme_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be null for anonymous
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create scheme_applications table (for tracking external clicks)
CREATE TABLE IF NOT EXISTS scheme_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update the search vector automatically
CREATE OR REPLACE FUNCTION schemes_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.crop_keywords, ' '), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.beneficiary_keywords, ' '), '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Trigger to execute the search vector update function
DROP TRIGGER IF EXISTS trg_schemes_search_vector_update ON schemes;
CREATE TRIGGER trg_schemes_search_vector_update
BEFORE INSERT OR UPDATE ON schemes
FOR EACH ROW EXECUTE FUNCTION schemes_search_vector_update();
