-- =============================================
-- Supabase Database Migration
-- RealEstate Platform - Auth & User Management
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Countries table (for phone login validation)
-- Super admin configures which countries are available
-- and how many digits the phone number should be
-- =============================================
CREATE TABLE public.countries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_ru VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL UNIQUE,  -- e.g., "+966"
  phone_validation_length INTEGER NOT NULL DEFAULT 9,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default: Saudi Arabia
INSERT INTO public.countries (name_en, name_ar, name_ru, country_code, phone_validation_length)
VALUES ('Saudi Arabia', 'المملكة العربية السعودية', 'Саудовская Аравия', '+966', 9);

-- =============================================
-- 2. Metadata table (hardcoded types: city, service_area, currency)
-- Three language fields: English, Arabic, Russian
-- =============================================
CREATE TYPE metadata_type AS ENUM ('city', 'service_area', 'currency');

CREATE TABLE public.metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type metadata_type NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_ru VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on type for fast filtering
CREATE INDEX idx_metadata_type ON public.metadata(type);

-- =============================================
-- 3. Profiles table (extends Supabase auth.users)
-- =============================================
CREATE TYPE auth_provider_type AS ENUM ('google', 'email', 'phone', 'whatsapp');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sequential_id SERIAL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  whatsapp_phone_number VARCHAR(20),
  full_name VARCHAR(100) NOT NULL,
  gender gender_type,
  image_url TEXT,
  description TEXT,
  city_id UUID REFERENCES public.metadata(id) ON DELETE SET NULL,
  service_area_id UUID REFERENCES public.metadata(id) ON DELETE SET NULL,
  national_short_address VARCHAR(100),
  address VARCHAR(500),
  is_agent BOOLEAN NOT NULL DEFAULT false,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  auth_provider auth_provider_type NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX idx_profiles_whatsapp ON public.profiles(whatsapp_phone_number);
CREATE INDEX idx_profiles_agent ON public.profiles(is_agent);

-- =============================================
-- 4. User Services table (multi-value, one user can have many services)
-- Examples: office, building, etc.
-- =============================================
CREATE TABLE public.user_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_services_user ON public.user_services(user_id);

-- =============================================
-- 5. OTP Codes table (for phone & whatsapp verification)
-- =============================================
CREATE TABLE public.otp_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  auth_type VARCHAR(10) NOT NULL DEFAULT 'phone', -- 'phone' or 'whatsapp'
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(phone_number, auth_type)
);

CREATE INDEX idx_otp_phone ON public.otp_codes(phone_number, auth_type);

-- =============================================
-- 6. Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do anything (for admin operations)
CREATE POLICY "Service role full access profiles"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

-- User Services: Users can manage their own services
CREATE POLICY "Users can manage own services"
  ON public.user_services FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access services"
  ON public.user_services FOR ALL
  USING (auth.role() = 'service_role');

-- Countries: Public read, admin write
CREATE POLICY "Anyone can read active countries"
  ON public.countries FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access countries"
  ON public.countries FOR ALL
  USING (auth.role() = 'service_role');

-- Metadata: Public read, admin write
CREATE POLICY "Anyone can read metadata"
  ON public.metadata FOR SELECT
  USING (true);

CREATE POLICY "Service role full access metadata"
  ON public.metadata FOR ALL
  USING (auth.role() = 'service_role');

-- OTP: Service role only
CREATE POLICY "Service role full access otp"
  ON public.otp_codes FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- 7. Auto-update updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metadata_updated_at
  BEFORE UPDATE ON public.metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. Function to automatically create profile on signup
-- (for email/Google signups via Supabase Auth triggers)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, auth_provider, is_email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'auth_provider')::public.auth_provider_type, 'email'::public.auth_provider_type),
    CASE
      WHEN NEW.email_confirmed_at IS NOT NULL THEN true
      ELSE false
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    is_email_verified = EXCLUDED.is_email_verified;

  RETURN NEW;
END;
$$ language plpgsql security definer SET search_path = public;

-- Note: Uncomment the trigger below if you want automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
