-- Supabase Schema for Urumi Platform
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(16) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  namespace VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL,
  url VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores(created_at);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policy for service role full access (backend uses service role key)
CREATE POLICY "Service role full access" ON stores
  FOR ALL
  USING (true)
  WITH CHECK (true);
