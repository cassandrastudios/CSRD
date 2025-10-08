-- Add Missing Columns to Organizations Table
-- Run this in your Supabase SQL Editor

-- Add the missing columns that the app is trying to save
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add foreign key constraint only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'organizations_created_by_fkey'
    ) THEN
        ALTER TABLE organizations 
        ADD CONSTRAINT organizations_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update existing records to have default values for new columns (without created_by for now)
UPDATE organizations 
SET 
  website = COALESCE(website, ''),
  address = COALESCE(address, ''),
  city = COALESCE(city, ''),
  country = COALESCE(country, ''),
  phone = COALESCE(phone, '')
WHERE website IS NULL OR address IS NULL OR city IS NULL OR country IS NULL OR phone IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;
