-- Add note column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS note TEXT;
