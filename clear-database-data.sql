-- Script to clear all data from FoodFlow database
-- This script respects foreign key constraints by deleting in the correct order
-- Author: FoodFlow Team
-- Date: 2026-02-27

-- Start transaction to ensure data consistency
BEGIN;

-- Display message
DO $$
BEGIN
    RAISE NOTICE 'Starting to clear all data from FoodFlow database...';
END $$;

-- Delete data from tables with foreign key dependencies first
-- Order matters to avoid foreign key constraint violations

-- 1. Delete meal plans (depends on recipes and users)
DELETE FROM meal_plans;
RAISE NOTICE 'Cleared meal_plans table';

-- 2. Delete recipe ingredients (depends on recipes and ingredients)
DELETE FROM recipe_ingredients;
RAISE NOTICE 'Cleared recipe_ingredients table';

-- 3. Delete recipe likes (depends on recipes and users)
DELETE FROM recipe_likes;
RAISE NOTICE 'Cleared recipe_likes table';

-- 4. Delete note likes (depends on notes)
DELETE FROM note_likes;
RAISE NOTICE 'Cleared note_likes table';

-- 5. Delete notifications (depends on users)
DELETE FROM notifications;
RAISE NOTICE 'Cleared notifications table';

-- 6. Delete shopping list items (depends on users)
DELETE FROM shopping_list_items;
RAISE NOTICE 'Cleared shopping_list_items table';

-- 7. Delete recipes (depends on users)
DELETE FROM recipes;
RAISE NOTICE 'Cleared recipes table';

-- 8. Delete inventory (depends on users)
DELETE FROM inventory;
RAISE NOTICE 'Cleared inventory table';

-- 9. Delete users (no dependencies)
DELETE FROM users;
RAISE NOTICE 'Cleared users table';

-- 10. Delete ingredients (no dependencies)
DELETE FROM ingredients;
RAISE NOTICE 'Cleared ingredients table';

-- Reset auto-increment sequences to start from 1
-- This ensures new records start from ID 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE recipes_id_seq RESTART WITH 1;
ALTER SEQUENCE ingredients_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_id_seq RESTART WITH 1;
ALTER SEQUENCE meal_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_likes_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE shopping_list_items_id_seq RESTART WITH 1;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'All data cleared successfully! Database is now empty.';
    RAISE NOTICE 'Auto-increment sequences have been reset to 1.';
END $$;

-- Commit transaction
COMMIT;

-- Display summary
SELECT 
    'Data cleared successfully' AS status,
    NOW() AS cleared_at;
