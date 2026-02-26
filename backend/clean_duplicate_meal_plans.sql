-- Clean up duplicate meal plans before adding unique constraint
-- 在添加唯一约束之前清理重复的餐计划

-- Step 1: Identify duplicates
-- 步骤 1：识别重复项
SELECT 'Finding duplicate meal plans...' as info;
SELECT user_id, date, meal_type, COUNT(*) as count
FROM meal_plans
GROUP BY user_id, date, meal_type
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates (keep the one with the smallest id)
-- 步骤 2：删除重复项（保留 ID 最小的那个）
DELETE FROM meal_plans
WHERE id NOT IN (
    SELECT MIN(id)
    FROM meal_plans
    GROUP BY user_id, date, meal_type
);

-- Step 3: Verify no duplicates remain
-- 步骤 3：验证没有重复项
SELECT 'Verifying no duplicates remain...' as info;
SELECT user_id, date, meal_type, COUNT(*) as count
FROM meal_plans
GROUP BY user_id, date, meal_type
HAVING COUNT(*) > 1;

-- Step 4: Create unique constraint (user_id, date, meal_type)
-- 步骤 4：创建唯一约束 (user_id, date, meal_type)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_meal_plan_user_date_type'
    ) THEN
        ALTER TABLE meal_plans 
        ADD CONSTRAINT uq_meal_plan_user_date_type 
        UNIQUE (user_id, date, meal_type);
        RAISE NOTICE 'Added unique constraint uq_meal_plan_user_date_type';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Step 5: Verify the constraint was created
-- 步骤 5：验证约束已创建
SELECT 'Unique Constraints on meal_plans:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'meal_plans'::regclass AND contype = 'u';

-- Step 6: Show remaining meal plans
-- 步骤 6：显示剩余的餐计划
SELECT 'Remaining meal plans:' as info;
SELECT id, user_id, date, day_of_week, meal_type, recipe_id 
FROM meal_plans 
ORDER BY user_id, date, meal_type;
