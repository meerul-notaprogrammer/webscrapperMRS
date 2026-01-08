-- Migration to support multiple field codes and contacts
-- Run this in your Supabase SQL Editor

-- Add columns for rich data
ALTER TABLE tenders 
ADD COLUMN IF NOT EXISTS field_codes TEXT[], -- Array of strings for multiple Kod Bidang
ADD COLUMN IF NOT EXISTS contact_details JSONB; -- JSON array for multiple contacts

-- Update the tenders table to ensure ministry_location is nullable (it should be already, but good to ensure)
ALTER TABLE tenders ALTER COLUMN ministry_location DROP NOT NULL;
