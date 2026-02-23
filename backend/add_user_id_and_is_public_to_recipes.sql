-- Add user_id and is_public columns to recipes table for user isolation
-- This migration adds user_id and is_public columns to track recipe ownership and visibility

-- Add user_id column (nullable initially for existing records)
ALTER TABLE recipes ADD COLUMN user_id BIGINT;

-- Set user_id to 1 for existing records (default user for migration)
-- This ensures existing data is not lost
UPDATE recipes SET user_id = 1 WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting default values
ALTER TABLE recipes ALTER COLUMN user_id SET NOT NULL;

-- Add is_public column (default to false for existing records)
ALTER TABLE recipes ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Set is_public to true for existing public recipes based on status
UPDATE recipes SET is_public = true WHERE status = 'public';

-- Make is_public NOT NULL after setting default values
ALTER TABLE recipes ALTER COLUMN is_public SET NOT NULL;

-- Add index on user_id for better query performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);

-- Add index on is_public for better query performance
CREATE INDEX idx_recipes_is_public ON recipes(is_public);

-- Add composite index for user_id and is_public for combined queries
CREATE INDEX idx_recipes_user_id_is_public ON recipes(user_id, is_public);

-- Add foreign key constraint to users table (optional, for referential integrity)
-- Uncomment the following line if you want to enforce referential integrity
-- ALTER TABLE recipes ADD CONSTRAINT fk_recipes_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Migration complete
-- After this migration:
-- 1. All recipe records will have a user_id field
-- 2. Existing records will be assigned to user_id = 1
-- 3. All records will have an is_public field
-- 4. Existing recipes with status='public' will have is_public=true
-- 5. Other recipes will have is_public=false
-- 6. New records must include user_id (NOT NULL constraint)
-- 7. New records must include is_public (NOT NULL constraint)
-- 8. Queries can filter by user_id for data isolation
-- 9. Queries can filter by is_public for public recipes
-- 10. Indexes on user_id, is_public, and composite index for performance
