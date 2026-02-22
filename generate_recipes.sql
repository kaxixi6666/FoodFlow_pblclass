-- SQL script to generate random recipe data

-- Insert recipes
INSERT INTO recipes (name, status, prep_time, cook_time, servings, instructions, created_at, updated_at) VALUES
('Grilled Chicken Salad', 'public', '15 min', '20 min', 2, '1. Preheat the grill to medium-high heat.
2. Season chicken breasts with salt and pepper.
3. Grill for 6-8 minutes per side until cooked through.
4. Let rest for 5 minutes, then slice.
5. Toss with mixed greens, tomatoes, and olive oil dressing.', NOW(), NOW()),
('Tomato Basil Pasta', 'draft', '10 min', '15 min', 4, '1. Bring a large pot of salted water to a boil.
2. Cook pasta according to package instructions.
3. In a pan, sauté garlic in olive oil until fragrant.
4. Add tomatoes and cook until soft.
5. Toss with cooked pasta and fresh basil.', NOW(), NOW()),
('Cheesy Omelette', 'public', '5 min', '10 min', 1, '1. Beat eggs in a bowl with salt and pepper.
2. Heat a non-stick pan over medium heat.
3. Pour in eggs and let cook for 1 minute.
4. Add cheddar cheese and fold omelette in half.
5. Cook for another minute until cheese melts.', NOW(), NOW()),
('Chicken Stir Fry', 'draft', '15 min', '10 min', 3, '1. Slice chicken breast into thin strips.
2. Heat olive oil in a wok or large pan.
3. Stir fry chicken until cooked through.
4. Add vegetables and cook until crisp-tender.
5. Serve over rice.', NOW(), NOW()),
('Tomato Soup', 'public', '10 min', '20 min', 4, '1. Heat olive oil in a pot over medium heat.
2. Sauté onions until soft.
3. Add tomatoes and broth.
4. Simmer for 15 minutes.
5. Blend until smooth and season with salt and pepper.', NOW(), NOW()),
('Grilled Cheese Sandwich', 'draft', '5 min', '10 min', 2, '1. Spread butter on one side of each bread slice.
2. Place cheddar cheese between bread slices.
3. Cook in a pan over medium heat until golden brown on both sides.
4. Serve with tomato soup.', NOW(), NOW()),
('Chicken and Rice Bowl', 'public', '20 min', '25 min', 3, '1. Cook rice according to package instructions.
2. Season chicken breast with salt and pepper.
3. Grill or pan-fry until cooked through.
4. Slice chicken and place over rice.
5. Top with tomatoes and drizzle with olive oil.', NOW(), NOW()),
('Caprese Salad', 'draft', '10 min', '5 min', 2, '1. Slice tomatoes and mozzarella cheese.
2. Arrange on a plate alternating tomato and cheese slices.
3. Drizzle with olive oil and balsamic glaze.
4. Sprinkle with fresh basil and salt.
5. Serve immediately.', NOW(), NOW()),
('Chicken Parmesan', 'public', '20 min', '30 min', 4, '1. Preheat oven to 375°F.
2. Bread chicken breasts with breadcrumbs.
3. Fry in olive oil until golden brown.
4. Top with marinara sauce and cheddar cheese.
5. Bake for 15 minutes until cheese is melted.', NOW(), NOW()),
('Vegetable Omelette', 'draft', '10 min', '10 min', 1, '1. Beat eggs in a bowl with salt and pepper.
2. Heat olive oil in a pan.
3. Sauté vegetables until soft.
4. Pour in eggs and cook until set.
5. Fold and serve with toast.', NOW(), NOW());

-- Insert recipe-ingredient relationships
-- Recipe 1: Grilled Chicken Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(1, 4), -- Chicken Breast
(1, 2), -- Tomatoes
(1, 3); -- Olive Oil

-- Recipe 2: Tomato Basil Pasta
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(2, 2), -- Tomatoes
(2, 3); -- Olive Oil

-- Recipe 3: Cheesy Omelette
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(3, 5); -- Cheddar Cheese

-- Recipe 4: Chicken Stir Fry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(4, 4), -- Chicken Breast
(4, 3); -- Olive Oil

-- Recipe 5: Tomato Soup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(5, 2), -- Tomatoes
(5, 3); -- Olive Oil

-- Recipe 6: Grilled Cheese Sandwich
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(6, 5); -- Cheddar Cheese

-- Recipe 7: Chicken and Rice Bowl
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(7, 4), -- Chicken Breast
(7, 2), -- Tomatoes
(7, 3); -- Olive Oil

-- Recipe 8: Caprese Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(8, 2), -- Tomatoes
(8, 3); -- Olive Oil

-- Recipe 9: Chicken Parmesan
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(9, 4), -- Chicken Breast
(9, 5), -- Cheddar Cheese
(9, 3); -- Olive Oil

-- Recipe 10: Vegetable Omelette
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
(10, 5), -- Cheddar Cheese
(10, 3); -- Olive Oil;

-- Verify insertion
SELECT COUNT(*) AS total_recipes FROM recipes;
SELECT COUNT(*) AS total_recipe_ingredients FROM recipe_ingredients;
