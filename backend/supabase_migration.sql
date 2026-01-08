-- Run this in Supabase SQL Editor to update existing table
-- This adds missing columns for the scraper

-- Add missing columns
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS date_iklan TIMESTAMP;
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS tempoh_sah_laku VARCHAR(100);
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS tender_link TEXT;

-- Make category_code nullable (scraper doesn't always have this)
ALTER TABLE tenders ALTER COLUMN category_code DROP NOT NULL;

-- Make date_closing nullable (in case of parse errors)
ALTER TABLE tenders ALTER COLUMN date_closing DROP NOT NULL;

-- Set default for tags array
ALTER TABLE tenders ALTER COLUMN tags SET DEFAULT '{}';

-- Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenders'
ORDER BY ordinal_position;
