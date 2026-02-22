package com.foodflow.service;

import com.foodflow.model.Recipe;
import com.foodflow.model.Ingredient;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class RecipeDataGenerator {

    @PersistenceContext
    private EntityManager entityManager;

    private final Random random = new Random();

    private final String[] recipeNames = {
        "Grilled Chicken Salad",
        "Pasta Primavera",
        "Greek Yogurt Parfait",
        "Stir-Fry Vegetables",
        "Chicken Rice Bowl",
        "Cheese Omelette",
        "Beef Steak with Vegetables",
        "Salmon with Lemon Butter Sauce",
        "Vegetable Curry",
        "Tomato Basil Soup",
        "Margherita Pizza",
        "Shrimp Scampi",
        "Beef Burger",
        "Veggie Wrap",
        "Chocolate Chip Cookies"
    };

    private final String[] instructions = {
        "1. Preheat the oven to 375°F (190°C).\n2. Prepare the ingredients.\n3. Cook according to the recipe.\n4. Serve hot and enjoy!",
        "1. Boil water in a large pot.\n2. Add the main ingredient and cook until tender.\n3. Prepare the sauce.\n4. Combine everything and serve.",
        "1. Chop all vegetables.\n2. Heat oil in a pan.\n3. Sauté vegetables until soft.\n4. Add seasonings and serve.",
        "1. Marinate the meat for at least 30 minutes.\n2. Grill until cooked to your liking.\n3. Serve with side dishes.",
        "1. Cook rice according to package instructions.\n2. Prepare the toppings.\n3. Assemble the bowl and serve."
    };

    private final String[] statuses = {"draft", "public"};

    @Transactional
    public void generateRandomRecipes(int count) {
        // Get all available ingredients
        List<Ingredient> allIngredients = entityManager.createQuery("SELECT i FROM Ingredient i", Ingredient.class).getResultList();
        
        if (allIngredients.isEmpty()) {
            System.out.println("No ingredients found in database. Please add ingredients first.");
            return;
        }

        for (int i = 0; i < count; i++) {
            Recipe recipe = new Recipe();
            
            // Set random recipe name
            recipe.setName(recipeNames[random.nextInt(recipeNames.length)]);
            
            // Set random status
            recipe.setStatus(statuses[random.nextInt(statuses.length)]);
            
            // Set random prep time
            int prepTime = random.nextInt(30) + 5; // 5-34 minutes
            recipe.setPrepTime(prepTime + " min");
            
            // Set random cook time
            int cookTime = random.nextInt(60) + 10; // 10-69 minutes
            recipe.setCookTime(cookTime + " min");
            
            // Set random servings
            int servings = random.nextInt(4) + 1; // 1-5 servings
            recipe.setServings(servings);
            
            // Set random instructions
            recipe.setInstructions(instructions[random.nextInt(instructions.length)]);
            
            // Set random ingredients (3-5 ingredients per recipe)
            List<Ingredient> selectedIngredients = new ArrayList<>();
            int ingredientCount = random.nextInt(3) + 3; // 3-5 ingredients
            for (int j = 0; j < ingredientCount; j++) {
                Ingredient randomIngredient = allIngredients.get(random.nextInt(allIngredients.size()));
                if (!selectedIngredients.contains(randomIngredient)) {
                    selectedIngredients.add(randomIngredient);
                }
            }
            recipe.setIngredients(selectedIngredients);
            
            // Save recipe
            entityManager.persist(recipe);
        }
        
        System.out.println("Successfully generated " + count + " random recipes!");
    }
}
