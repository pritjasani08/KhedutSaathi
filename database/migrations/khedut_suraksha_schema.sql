-- Migration: Khedut Suraksha Feature Schema
-- Description: Creates tables for Crop Insurance Assistant

-- 1. Insurance Scheme Rules (Optional to sync with JSON)
CREATE TABLE IF NOT EXISTS public.insurance_scheme_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    supported_claim_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Insurance Claims
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheme_code VARCHAR(50) NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100),
    farm_area DECIMAL(10, 2),
    damage_type VARCHAR(100) NOT NULL,
    damage_date DATE NOT NULL,
    weather_summary JSONB,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Under Review, Approved, Rejected
    eligibility_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Claim Readiness Scores
CREATE TABLE IF NOT EXISTS public.claim_readiness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE UNIQUE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
    eligibility_report TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Insurance Documents
CREATE TABLE IF NOT EXISTS public.insurance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE public.insurance_scheme_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read scheme rules
CREATE POLICY "Enable read access for all users on rules" 
ON public.insurance_scheme_rules FOR SELECT USING (true);

-- Farmers can manage their own claims
CREATE POLICY "Users can manage their own claims" 
ON public.insurance_claims 
FOR ALL USING (auth.uid() = farmer_id);

-- Farmers can manage their own readiness scores
CREATE POLICY "Users can view their claim scores" 
ON public.claim_readiness_scores 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.farmer_id = auth.uid())
);
CREATE POLICY "Users can manage their claim scores" 
ON public.claim_readiness_scores 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.farmer_id = auth.uid())
);
CREATE POLICY "Users can update their claim scores" 
ON public.claim_readiness_scores 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.farmer_id = auth.uid())
);

-- Farmers can manage their own documents
CREATE POLICY "Users can view their claim documents" 
ON public.insurance_documents 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.farmer_id = auth.uid())
);
CREATE POLICY "Users can insert claim documents" 
ON public.insurance_documents 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.farmer_id = auth.uid())
);
CREATE POLICY "Users can delete claim documents" 
ON public.insurance_documents 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.farmer_id = auth.uid())
);
