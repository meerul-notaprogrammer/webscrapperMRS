-- ePerolehan Scraper Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenders Table
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    category_code VARCHAR(10) NOT NULL,
    category_name VARCHAR(255),
    summary TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(15,2),
    ministry_name VARCHAR(255),
    ministry_department VARCHAR(255),
    ministry_contact VARCHAR(255),
    ministry_phone VARCHAR(50),
    ministry_location VARCHAR(255),
    date_published TIMESTAMP,
    date_closing TIMESTAMP NOT NULL,
    date_briefing TIMESTAMP,
    days_remaining INTEGER,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'accepted', 'onhold', 'removed')),
    is_urgent BOOLEAN DEFAULT FALSE,
    budget_code VARCHAR(50),
    payment_terms VARCHAR(255),
    notes TEXT,
    scraped_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS tender_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activity History Table
CREATE TABLE IF NOT EXISTS tender_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    user_name VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Scrape Logs Table
CREATE TABLE IF NOT EXISTS scrape_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scrape_time TIMESTAMP DEFAULT NOW(),
    tenders_found INTEGER DEFAULT 0,
    new_tenders INTEGER DEFAULT 0,
    updated_tenders INTEGER DEFAULT 0,
    errors TEXT,
    duration_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial'))
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    keywords TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category_code);
CREATE INDEX IF NOT EXISTS idx_tenders_closing_date ON tenders(date_closing);
CREATE INDEX IF NOT EXISTS idx_tenders_quotation ON tenders(quotation_number);
CREATE INDEX IF NOT EXISTS idx_tenders_urgent ON tenders(is_urgent);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_time ON scrape_logs(scrape_time DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate days remaining
CREATE OR REPLACE FUNCTION calculate_days_remaining()
RETURNS TRIGGER AS $$
BEGIN
    NEW.days_remaining = EXTRACT(DAY FROM (NEW.date_closing - NOW()));
    NEW.is_urgent = (NEW.days_remaining < 7);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate days remaining
CREATE TRIGGER update_days_remaining BEFORE INSERT OR UPDATE ON tenders
    FOR EACH ROW EXECUTE FUNCTION calculate_days_remaining();

-- Insert default categories
INSERT INTO categories (code, name, enabled) VALUES
    ('010302', 'Penerbitan dan Penyiaran', TRUE),
    ('020301', 'Perabot Pejabat', TRUE),
    ('020302', 'Perabot Elektronik', TRUE),
    ('020401', 'Peralatan Domestik', TRUE),
    ('020601', 'Bekalan Pejabat', TRUE),
    ('120401', 'Alat Keselamatan', TRUE),
    ('120501', 'Pengesanan dan Pemantauan', TRUE),
    ('120502', 'Perkhidmatan Keselamatan', TRUE),
    ('120503', 'Sistem Keselamatan', TRUE),
    ('130201', 'Perkhidmatan Pembersihan', TRUE),
    ('140301', 'Perkhidmatan Penyelenggaraan Bangunan', TRUE),
    ('140302', 'Perkhidmatan Penyelenggaraan Peralatan', TRUE),
    ('140501', 'Perkhidmatan Teknologi Maklumat', TRUE),
    ('140502', 'Perkhidmatan Rangkaian', TRUE),
    ('210101', 'Komputer Desktop', TRUE),
    ('210102', 'Komputer Riba', TRUE),
    ('210103', 'Pelayan (Server)', TRUE),
    ('210104', 'Peranti Storan', TRUE),
    ('210105', 'Pencetak', TRUE),
    ('210106', 'Pengimbas', TRUE),
    ('210107', 'Projektor', TRUE),
    ('210108', 'UPS', TRUE),
    ('210109', 'Peralatan Rangkaian', TRUE),
    ('210201', 'Perisian Sistem Operasi', TRUE),
    ('210202', 'Perisian Aplikasi', TRUE),
    ('210203', 'Perisian Keselamatan', TRUE),
    ('220402', 'Peralatan Telekomunikasi', TRUE),
    ('221110', 'Peralatan Audio Visual', TRUE),
    ('221502', 'Peralatan Fotografi', TRUE),
    ('221511', 'Peralatan Video', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth needs)
CREATE POLICY "Enable read access for all users" ON tenders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tenders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON tenders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON tenders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON tender_documents FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tender_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON tender_activity FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tender_activity FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON scrape_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON scrape_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON settings FOR UPDATE USING (true);
