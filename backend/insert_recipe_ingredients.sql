-- Insert recipe-ingredient associations
-- Each recipe will have 2-4 random ingredients
-- Recipe IDs are 2-21 (not 1-20)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
-- Recipe 2: Garlic Butter Chicken
(2, 2), (2, 3),
-- Recipe 3: Tomato Basil Soup
(3, 1), (3, 3),
-- Recipe 4: Grilled Cheese Sandwich
(4, 3),
-- Recipe 5: Caesar Salad
(5, 1), (5, 3), (5, 4),
-- Recipe 6: Spaghetti Carbonara
(6, 2), (6, 3),
-- Recipe 7: Beef Tacos
(7, 2), (7, 1),
-- Recipe 8: Vegetable Stir Fry
(8, 1), (8, 2), (8, 4),
-- Recipe 9: Chocolate Chip Cookies
(9, 3),
-- Recipe 10: Mushroom Risotto
(10, 2), (10, 3),
-- Recipe 11: Fish and Chips
(11, 2),
-- Recipe 12: Chicken Alfredo
(12, 2), (12, 3),
-- Recipe 13: Margherita Pizza
(13, 1), (13, 3),
-- Recipe 14: Beef Stew
(14, 2), (14, 1), (14, 4),
-- Recipe 15: Pancakes
(15, 3),
-- Recipe 16: Greek Salad
(16, 1), (16, 3), (16, 4),
-- Recipe 17: BBQ Ribs
(17, 2),
-- Recipe 18: Pad Thai
(18, 2), (18, 1),
-- Recipe 19: Lobster Bisque
(19, 3),
-- Recipe 20: Sushi Rolls
(20, 2), (20, 1), (20, 4),
-- Recipe 21: Tiramisu
(21, 3);

-- Verify data
SELECT 
    r.id,
    r.name,
    r.status,
    r.prep_time,
    r.cook_time,
    r.servings,
    COUNT(ri.ingredient_id) as ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
GROUP BY r.id, r.name, r.status, r.prep_time, r.cook_time, r.servings
ORDER BY r.id;