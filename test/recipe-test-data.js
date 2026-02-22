// Recipe Test Data

// Test recipes for different categories
export const testRecipes = [
  {
    id: 1,
    name: "Classic Margherita Pizza",
    ingredients: ["Pizza Dough", "Tomato Sauce", "Fresh Mozzarella", "Basil Leaves", "Olive Oil"],
    status: "public",
    prepTime: "20 min",
    cookTime: "15 min",
    servings: 4,
    instructions: "1. Preheat oven to 475°F (245°C).\n2. Roll out pizza dough on a floured surface.\n3. Spread tomato sauce evenly over dough.\n4. Tear fresh mozzarella and distribute over sauce.\n5. Bake for 12-15 minutes until crust is golden.\n6. Top with fresh basil leaves and drizzle with olive oil."
  },
  {
    id: 2,
    name: "Vegetable Stir Fry",
    ingredients: ["Bell Peppers", "Broccoli", "Carrots", "Snow Peas", "Soy Sauce", "Garlic", "Ginger"],
    status: "private",
    prepTime: "15 min",
    cookTime: "10 min",
    servings: 2,
    instructions: "1. Heat oil in a wok or large skillet over high heat.\n2. Add garlic and ginger, cook for 30 seconds.\n3. Add vegetables and stir fry for 5-7 minutes until crisp-tender.\n4. Drizzle with soy sauce and toss to coat.\n5. Serve over rice or noodles."
  },
  {
    id: 3,
    name: "Chicken Caesar Salad",
    ingredients: ["Chicken Breast", "Romaine Lettuce", "Caesar Dressing", "Croutons", "Parmesan Cheese"],
    status: "draft",
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 2,
    instructions: "1. Grill or pan-fry chicken breast until cooked through.\n2. Chop romaine lettuce into bite-sized pieces.\n3. Slice cooked chicken into strips.\n4. Toss lettuce with Caesar dressing.\n5. Top with chicken, croutons, and grated Parmesan."
  },
  {
    id: 4,
    name: "Chocolate Chip Cookies",
    ingredients: ["All-Purpose Flour", "Butter", "Brown Sugar", "White Sugar", "Eggs", "Vanilla Extract", "Chocolate Chips", "Baking Soda"],
    status: "public",
    prepTime: "20 min",
    cookTime: "10 min",
    servings: 24,
    instructions: "1. Preheat oven to 375°F (190°C).\n2. Cream together butter and sugars until light and fluffy.\n3. Beat in eggs one at a time, then stir in vanilla.\n4. Combine flour and baking soda, gradually add to creamed mixture.\n5. Stir in chocolate chips.\n6. Drop by rounded tablespoons onto ungreased baking sheets.\n7. Bake for 9-11 minutes until golden brown."
  },
  {
    id: 5,
    name: "Beef Burger",
    ingredients: ["Ground Beef", "Burger Buns", "Lettuce", "Tomato", "Onion", "Cheese", "Ketchup", "Mustard"],
    status: "private",
    prepTime: "10 min",
    cookTime: "10 min",
    servings: 4,
    instructions: "1. Preheat grill or skillet to medium-high heat.\n2. Form ground beef into patties.\n3. Cook patties for 4-5 minutes per side until desired doneness.\n4. Toast burger buns.\n5. Assemble burgers with patties, cheese, lettuce, tomato, onion, ketchup, and mustard."
  }
];

// Test ingredients for recipe creation
export const testIngredients = [
  "Pizza Dough", "Tomato Sauce", "Fresh Mozzarella", "Basil Leaves", "Olive Oil",
  "Bell Peppers", "Broccoli", "Carrots", "Snow Peas", "Soy Sauce", "Garlic", "Ginger",
  "Chicken Breast", "Romaine Lettuce", "Caesar Dressing", "Croutons", "Parmesan Cheese",
  "All-Purpose Flour", "Butter", "Brown Sugar", "White Sugar", "Eggs", "Vanilla Extract", "Chocolate Chips", "Baking Soda",
  "Ground Beef", "Burger Buns", "Lettuce", "Tomato", "Onion", "Cheese", "Ketchup", "Mustard"
];

// Test recipe creation payloads
export const recipeCreationPayloads = [
  {
    name: "Spaghetti Carbonara",
    ingredients: ["Spaghetti", "Eggs", "Pancetta", "Parmesan Cheese", "Black Pepper"],
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 2,
    instructions: "1. Cook spaghetti according to package instructions.\n2. Fry pancetta until crispy.\n3. Beat eggs with Parmesan and black pepper.\n4. Drain spaghetti, reserving some pasta water.\n5. Toss spaghetti with pancetta, then with egg mixture, adding pasta water as needed."
  },
  {
    name: "Guacamole",
    ingredients: ["Avocado", "Lime Juice", "Onion", "Tomato", "Cilantro", "Salt", "Pepper"],
    prepTime: "10 min",
    cookTime: "0 min",
    servings: 4,
    instructions: "1. Cut avocados in half, remove pits, and scoop flesh into a bowl.\n2. Mash avocados with a fork.\n3. Add lime juice, chopped onion, tomato, and cilantro.\n4. Season with salt and pepper to taste.\n5. Mix well and serve."
  },
  {
    name: "Omelette",
    ingredients: ["Eggs", "Milk", "Salt", "Pepper", "Cheese", "Ham", "Mushrooms"],
    prepTime: "5 min",
    cookTime: "5 min",
    servings: 1,
    instructions: "1. Beat eggs with milk, salt, and pepper.\n2. Heat a non-stick skillet over medium heat.\n3. Pour egg mixture into skillet.\n4. When edges start to set, add cheese, ham, and mushrooms.\n5. Fold omelette in half and cook until eggs are set."
  }
];

// Test cases for recipe creation
export const recipeTestCases = [
  {
    name: "Create pizza recipe",
    payload: recipeCreationPayloads[0],
    expectedStatus: "public"
  },
  {
    name: "Create appetizer recipe",
    payload: recipeCreationPayloads[1],
    expectedStatus: "private"
  },
  {
    name: "Create breakfast recipe",
    payload: recipeCreationPayloads[2],
    expectedStatus: "draft"
  }
];
