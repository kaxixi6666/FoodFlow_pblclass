-- Production Database Migration for Inventory User Isolation
-- Date: 2026-02-23
-- Purpose: Add user_id field to inventory table for data isolation

-- Step 1: Add user_id column with default value
-- This ensures existing records get a default user_id (user id = 1)
ALTER TABLE inventory ADD COLUMN user_id BIGINT DEFAULT 1;

-- Step 2: Set NOT NULL constraint
-- After setting default values, we can enforce NOT NULL
ALTER TABLE inventory ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Add foreign key constraint
-- Link user_id to users table for referential integrity
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_user 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Step 4: Verify the changes
-- Check the table structure
\d inventory

-- Verify existing records have user_id set
SELECT id, ingredient_id, user_id, created_at, last_updated 
FROM inventory 
LIMIT 5;
