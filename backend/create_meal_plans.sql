-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    recipe_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meal_plan_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT uq_meal_plan_date_type UNIQUE (date, meal_type)
);

-- Create index on date for faster queries
CREATE INDEX idx_meal_plans_date ON meal_plans(date);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    checked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on checked for faster queries
CREATE INDEX idx_shopping_list_checked ON shopping_list_items(checked);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for meal_plans table
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for shopping_list_items table
CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON shopping_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample meal plans
INSERT INTO meal_plans (date, day_of_week, meal_type, recipe_id)
SELECT 
    CURRENT_DATE + (n || ' days')::INTERVAL,
    CASE EXTRACT(DOW FROM CURRENT_DATE + (n || ' days')::INTERVAL)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END,
    CASE n % 3
        WHEN 0 THEN 'breakfast'
        WHEN 1 THEN 'lunch'
        WHEN 2 THEN 'dinner'
    END,
    (SELECT id FROM recipes ORDER BY RANDOM() LIMIT 1)
FROM generate_series(0, 6) AS n
ON CONFLICT (date, meal_type) DO NOTHING;

-- Insert sample shopping list items
INSERT INTO shopping_list_items (name, category, checked)
VALUES
    ('Chicken Breast', 'Meat', false),
    ('Fresh Spinach', 'Vegetables', false),
    ('Cherry Tomatoes', 'Vegetables', false),
    ('Olive Oil', 'Pantry', true),
    ('Pasta', 'Pantry', false),
    ('Garlic', 'Vegetables', false),
    ('Greek Yogurt', 'Dairy', false),
    ('Honey', 'Pantry', false),
    ('Eggs', 'Dairy', false),
    ('Cheddar Cheese', 'Dairy', false)
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 'Meal Plans:' as info;
SELECT id, date, day_of_week, meal_type, recipe_id FROM meal_plans ORDER BY date, meal_type;

SELECT 'Shopping List Items:' as info;
SELECT id, name, category, checked FROM shopping_list_items ORDER BY id;