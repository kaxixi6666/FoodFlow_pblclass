-- Generate 20 random recipes with draft and public status
-- This script inserts recipes and their ingredient associations

-- Insert 20 recipes (10 draft, 10 public)
INSERT INTO recipes (name, status, prep_time, cook_time, servings, instructions, created_at, updated_at) VALUES
-- Draft recipes (1-10)
('Garlic Butter Chicken', 'draft', '15 min', '25 min', 4, 'Season chicken with salt and pepper. Heat butter in a pan, add minced garlic. Cook chicken until golden brown. Add herbs and serve hot.', NOW(), NOW()),
('Tomato Basil Soup', 'draft', '10 min', '30 min', 6, 'Sauté onions and garlic in olive oil. Add chopped tomatoes and vegetable broth. Simmer for 20 minutes. Blend until smooth and add fresh basil.', NOW(), NOW()),
('Grilled Cheese Sandwich', 'draft', '5 min', '10 min', 2, 'Butter bread slices. Place cheese between bread. Grill on medium heat until cheese melts and bread is golden brown.', NOW(), NOW()),
('Caesar Salad', 'draft', '15 min', '0 min', 4, 'Mix romaine lettuce with Caesar dressing. Add croutons and parmesan cheese. Toss well and serve immediately.', NOW(), NOW()),
('Spaghetti Carbonara', 'draft', '10 min', '20 min', 4, 'Cook spaghetti according to package. Fry pancetta until crispy. Mix eggs with parmesan. Combine all with pasta and pepper.', NOW(), NOW()),
('Beef Tacos', 'draft', '20 min', '15 min', 4, 'Season ground beef with taco spices. Cook until browned. Warm tortillas and assemble with toppings of your choice.', NOW(), NOW()),
('Vegetable Stir Fry', 'draft', '15 min', '10 min', 3, 'Heat oil in wok. Add mixed vegetables and stir fry. Add soy sauce and ginger. Serve over rice.', NOW(), NOW()),
('Chocolate Chip Cookies', 'draft', '15 min', '12 min', 24, 'Mix flour, butter, sugar, and eggs. Add chocolate chips. Drop spoonfuls on baking sheet. Bake at 375°F.', NOW(), NOW()),
('Mushroom Risotto', 'draft', '10 min', '30 min', 4, 'Sauté mushrooms and onions. Add arborio rice and wine. Gradually add broth while stirring. Finish with parmesan.', NOW(), NOW()),
('Fish and Chips', 'draft', '20 min', '15 min', 2, 'Coat fish in batter and fry until golden. Cut potatoes into chips and fry until crispy. Serve with tartar sauce.', NOW(), NOW()),
-- Public recipes (11-20)
('Chicken Alfredo', 'public', '15 min', '20 min', 4, 'Cook fettuccine pasta. Sauté chicken breast in butter. Mix with alfredo sauce and parmesan. Combine with pasta.', NOW(), NOW()),
('Margherita Pizza', 'public', '20 min', '15 min', 4, 'Roll out pizza dough. Spread tomato sauce, add mozzarella and fresh basil. Bake at 450°F until crust is golden.', NOW(), NOW()),
('Beef Stew', 'public', '20 min', '90 min', 6, 'Brown beef cubes in oil. Add vegetables and beef broth. Simmer on low heat until meat is tender. Season to taste.', NOW(), NOW()),
('Pancakes', 'public', '10 min', '15 min', 8, 'Mix flour, eggs, milk, and baking powder. Pour batter onto hot griddle. Flip when bubbles form. Serve with syrup.', NOW(), NOW()),
('Greek Salad', 'public', '15 min', '0 min', 4, 'Combine cucumber, tomatoes, olives, and feta cheese. Dress with olive oil and oregano. Serve chilled.', NOW(), NOW()),
('BBQ Ribs', 'public', '30 min', '180 min', 4, 'Season ribs with dry rub. Grill on low heat for 3 hours. Baste with BBQ sauce during last 30 minutes.', NOW(), NOW()),
('Pad Thai', 'public', '15 min', '10 min', 2, 'Soak rice noodles. Stir fry shrimp, eggs, and bean sprouts. Add noodles and pad thai sauce. Garnish with peanuts.', NOW(), NOW()),
('Lobster Bisque', 'public', '30 min', '45 min', 4, 'Sauté lobster shells in butter. Add cream and sherry. Blend until smooth. Strain and serve with lobster meat.', NOW(), NOW()),
('Sushi Rolls', 'public', '45 min', '30 min', 8, 'Season sushi rice with vinegar. Place rice on nori, add fish and vegetables. Roll tightly and slice into pieces.', NOW(), NOW()),
('Tiramisu', 'public', '20 min', '240 min', 8, 'Layer ladyfingers dipped in coffee with mascarpone cream. Dust with cocoa powder. Refrigerate for 4 hours before serving.', NOW(), NOW());

-- Insert recipe-ingredient associations
-- Each recipe will have 2-4 random ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES
-- Recipe 1: Garlic Butter Chicken
(1, 2), (1, 3),
-- Recipe 2: Tomato Basil Soup
(2, 1), (2, 3),
-- Recipe 3: Grilled Cheese Sandwich
(3, 3),
-- Recipe 4: Caesar Salad
(4, 1), (4, 3), (4, 4),
-- Recipe 5: Spaghetti Carbonara
(5, 2), (5, 3),
-- Recipe 6: Beef Tacos
(6, 2), (6, 1),
-- Recipe 7: Vegetable Stir Fry
(7, 1), (7, 2), (7, 4),
-- Recipe 8: Chocolate Chip Cookies
(8, 3),
-- Recipe 9: Mushroom Risotto
(9, 2), (9, 3),
-- Recipe 10: Fish and Chips
(10, 2),
-- Recipe 11: Chicken Alfredo
(11, 2), (11, 3),
-- Recipe 12: Margherita Pizza
(12, 1), (12, 3),
-- Recipe 13: Beef Stew
(13, 2), (13, 1), (13, 4),
-- Recipe 14: Pancakes
(14, 3),
-- Recipe 15: Greek Salad
(15, 1), (15, 3), (15, 4),
-- Recipe 16: BBQ Ribs
(16, 2),
-- Recipe 17: Pad Thai
(17, 2), (17, 1),
-- Recipe 18: Lobster Bisque
(18, 3),
-- Recipe 19: Sushi Rolls
(19, 2), (19, 1), (19, 4),
-- Recipe 20: Tiramisu
(20, 3);

-- Verify the data
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