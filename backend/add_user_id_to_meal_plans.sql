-- Add user_id column to meal_plans table (for PostgreSQL production)
-- 添加 user_id 字段到 meal_plans 表（用于 PostgreSQL 生产环境）

-- Step 1: Add user_id column if it doesn't exist
-- 步骤 1：如果 user_id 列不存在，则添加它
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meal_plans' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE meal_plans ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1;
        RAISE NOTICE 'Added user_id column to meal_plans table';
    ELSE
        RAISE NOTICE 'user_id column already exists in meal_plans table';
    END IF;
END $$;

-- Step 2: Drop old unique constraint (date, meal_type) if it exists
-- 步骤 2：如果存在旧的唯一约束 (date, meal_type)，则删除它
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_meal_plan_date_type'
    ) THEN
        ALTER TABLE meal_plans DROP CONSTRAINT uq_meal_plan_date_type;
        RAISE NOTICE 'Dropped old unique constraint uq_meal_plan_date_type';
    ELSE
        RAISE NOTICE 'Old unique constraint does not exist';
    END IF;
END $$;

-- Step 3: Create new unique constraint (user_id, date, meal_type)
-- 步骤 3：创建新的唯一约束 (user_id, date, meal_type)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_meal_plan_user_date_type'
    ) THEN
        ALTER TABLE meal_plans 
        ADD CONSTRAINT uq_meal_plan_user_date_type 
        UNIQUE (user_id, date, meal_type);
        RAISE NOTICE 'Added new unique constraint uq_meal_plan_user_date_type';
    ELSE
        RAISE NOTICE 'New unique constraint already exists';
    END IF;
END $$;

-- Verify the changes
-- 验证更改
SELECT 'Meal Plans Table Structure:' as info;
\d meal_plans;

SELECT 'Unique Constraints on meal_plans:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'meal_plans'::regclass AND contype = 'u';
