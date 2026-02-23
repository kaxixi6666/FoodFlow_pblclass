-- Add user_id column to inventory table for user isolation
-- This migration adds user_id column to track which user owns each inventory item

-- Add user_id column (nullable initially for existing records)
ALTER TABLE inventory ADD COLUMN user_id BIGINT;

-- Set user_id to 1 for existing records (default user for migration)
-- This ensures existing data is not lost
UPDATE inventory SET user_id = 1 WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting default values
ALTER TABLE inventory ALTER COLUMN user_id SET NOT NULL;

-- Add index on user_id for better query performance
CREATE INDEX idx_inventory_user_id ON inventory(user_id);

-- Add foreign key constraint to users table (optional, for referential integrity)
-- Uncomment the following line if you want to enforce referential integrity
-- ALTER TABLE inventory ADD CONSTRAINT fk_inventory_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Migration complete
-- After this migration:
-- 1. All inventory records will have a user_id field
-- 2. Existing records will be assigned to user_id = 1
-- 3. New records must include user_id (NOT NULL constraint)
-- 4. Queries can filter by user_id for data isolation
-- 5. Index on user_id improves query performance
