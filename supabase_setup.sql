-- SUPABASE DATABASE SETUP MIGRATION
-- This script sets up the required tables, triggers, and Row Level Security (RLS) policies for the KREDO Escrow platform.
-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/_/sql).

-- -------------------------------------------------------------
-- 1. PROFILES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    organization_name TEXT DEFAULT '',
    country TEXT DEFAULT 'Ukraine',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_status TEXT DEFAULT 'Not Started' CHECK (kyc_status IN ('Not Started', 'Pending Review', 'Verified', 'Rejected')),
    kyc_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS organization_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ukraine',
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS kyc_notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Supabase Auth is the source of truth for unique account emails.
-- Removing this legacy uniqueness constraint prevents unrelated historical
-- profile rows from reserving an email, without deleting any existing data.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_email_key;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_email_confirmed()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email_confirmed_at IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_security_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.role IS DISTINCT FROM OLD.role
     OR (
       NEW.email_verified IS DISTINCT FROM OLD.email_verified
       AND NOT (
         COALESCE(OLD.email_verified, FALSE) = FALSE
         AND NEW.email_verified = TRUE
         AND auth.uid() = OLD.id
         AND public.is_current_user_email_confirmed()
       )
     )
     OR NEW.kyc_status IS DISTINCT FROM OLD.kyc_status
     OR NEW.kyc_notes IS DISTINCT FROM OLD.kyc_notes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Users may update only safe profile fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_security_fields ON public.profiles;
CREATE TRIGGER protect_profile_security_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_security_fields();

-- Turn on RLS for public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Define Profile RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Verified users can create their own profile" ON public.profiles;
CREATE POLICY "Verified users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  AND role = 'user'
);

DROP POLICY IF EXISTS "System/Admins can read all profiles" ON public.profiles;
CREATE POLICY "System/Admins can read all profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Legacy helper retained for compatibility only.
-- Profiles are finalized by the client after a successful signup OTP verification.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, email_verified, kyc_status, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'user',
    FALSE,
    'Not Started',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the old eager profile trigger without touching existing profile rows.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- -------------------------------------------------------------
-- 2. KYC REQUESTS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    document_front_url TEXT NOT NULL, -- Path relative to bucket 'kyc-documents'
    selfie_url TEXT NOT NULL,         -- Path relative to bucket 'kyc-documents'
    status TEXT DEFAULT 'Pending Review' CHECK (status IN ('Not Started', 'Pending Review', 'Verified', 'Rejected')),
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.kyc_requests
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS document_type TEXT,
  ADD COLUMN IF NOT EXISTS document_number TEXT,
  ADD COLUMN IF NOT EXISTS document_front_url TEXT,
  ADD COLUMN IF NOT EXISTS selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending Review',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'kyc_requests_status_check'
      AND conrelid = 'public.kyc_requests'::regclass
  ) THEN
    ALTER TABLE public.kyc_requests
      ADD CONSTRAINT kyc_requests_status_check
      CHECK (status IN ('Not Started', 'Pending Review', 'Verified', 'Rejected'));
  END IF;
END;
$$;

-- Index on user_id for swift lookups
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON public.kyc_requests (user_id);

-- Turn on RLS for kyc_requests
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own kyc request" ON public.kyc_requests;
CREATE POLICY "Users can view their own kyc request"
ON public.kyc_requests FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own kyc request" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users can create their own pending KYC request" ON public.kyc_requests;
CREATE POLICY "Users can create their own pending KYC request"
ON public.kyc_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'Pending Review'
  AND COALESCE(admin_notes, '') = ''
);

DROP POLICY IF EXISTS "Users can resubmit their own pending KYC request" ON public.kyc_requests;
CREATE POLICY "Users can resubmit their own pending KYC request"
ON public.kyc_requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'Pending Review'
  AND COALESCE(admin_notes, '') = ''
);

DROP POLICY IF EXISTS "Admins can view and manage all KYC requests" ON public.kyc_requests;
CREATE POLICY "Admins can view and manage all KYC requests"
ON public.kyc_requests FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.sync_kyc_profile_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    kyc_status = NEW.status,
    kyc_notes = COALESCE(NEW.admin_notes, '')
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_kyc_profile_status ON public.kyc_requests;
CREATE TRIGGER sync_kyc_profile_status
AFTER INSERT OR UPDATE OF status, admin_notes ON public.kyc_requests
FOR EACH ROW EXECUTE FUNCTION public.sync_kyc_profile_status();

-- -------------------------------------------------------------
-- 3. CONTACT REQUESTS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Keep a legacy destination_email column if it already exists, but do not require or populate it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contact_requests'
      AND column_name = 'destination_email'
  ) THEN
    ALTER TABLE public.contact_requests
      ALTER COLUMN destination_email DROP NOT NULL;
  END IF;
END;
$$;

-- Turn on RLS for contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact requests" ON public.contact_requests;
CREATE POLICY "Anyone can submit contact requests"
ON public.contact_requests FOR INSERT
WITH CHECK (
  status = 'pending'
  AND char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 254
  AND char_length(topic) BETWEEN 1 AND 100
  AND char_length(message) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Admins can view and manage all contact requests" ON public.contact_requests;
CREATE POLICY "Admins can view and manage all contact requests"
ON public.contact_requests FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- -------------------------------------------------------------
-- 4. NOTIFICATIONS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g. 'system', 'escrow', 'kyc', 'news'
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Index on user_id for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- Turn on RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update read status on their own notifications" ON public.notifications;
CREATE POLICY "Users can update read status on their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_notification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin()
     AND (
       NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.message IS DISTINCT FROM OLD.message
       OR NEW.type IS DISTINCT FROM OLD.type
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
     ) THEN
    RAISE EXCEPTION 'Users may update only notification read status';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_notification_fields ON public.notifications;
CREATE TRIGGER protect_notification_fields
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.protect_notification_fields();

DROP POLICY IF EXISTS "Admins/System can insert notifications" ON public.notifications;
CREATE POLICY "Admins/System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.notify_kyc_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'Pending Review'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'KYC submitted',
      'Документи надіслано на перевірку',
      'kyc'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_kyc_submission ON public.kyc_requests;
CREATE TRIGGER notify_kyc_submission
AFTER INSERT OR UPDATE OF status ON public.kyc_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_kyc_submission();


-- -------------------------------------------------------------
-- 5. STORAGE BUCKET CONFIGURATION (kyc-documents)
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Users upload their own KYC files" ON storage.objects;
CREATE POLICY "Users upload their own KYC files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users view their own KYC files" ON storage.objects;
CREATE POLICY "Users view their own KYC files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
);

DROP POLICY IF EXISTS "Users replace their own KYC files" ON storage.objects;
CREATE POLICY "Users replace their own KYC files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- -------------------------------------------------------------
-- 6. TRANSACTIONS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'UAH')),
    status TEXT NOT NULL DEFAULT 'created'
      CHECK (status IN ('created', 'funded', 'delivered', 'released', 'disputed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CHECK (buyer_id <> seller_id)
);

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(18, 2),
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'created',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions (buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions (seller_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their own transactions" ON public.transactions;
CREATE POLICY "Participants can view their own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can create transactions as a participant" ON public.transactions;
DROP POLICY IF EXISTS "Participants can update their own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
CREATE POLICY "Admins can manage all transactions"
ON public.transactions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Diagnostic only. Review manually before deleting anything:
-- SELECT p.*
-- FROM public.profiles AS p
-- LEFT JOIN auth.users AS u ON u.id = p.id
-- WHERE u.id IS NULL;
