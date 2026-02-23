package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import com.foodflow.model.Recipe;
import com.foodflow.service.RecipeDataGenerator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/recipes")
public class RecipeController {

    @PersistenceContext
    private EntityManager entityManager;

    private final RecipeDataGenerator recipeDataGenerator;

    public RecipeController(RecipeDataGenerator recipeDataGenerator) {
        this.recipeDataGenerator = recipeDataGenerator;
    }

    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        List<Recipe> recipes = entityManager.createQuery("SELECT r FROM Recipe r JOIN FETCH r.ingredients", Recipe.class).getResultList();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Recipe>> getRecipesByStatus(@PathVariable String status) {
        List<Recipe> recipes = entityManager.createQuery(
                "SELECT r FROM Recipe r JOIN FETCH r.ingredients WHERE r.status = :status", Recipe.class)
                .setParameter("status", status)
                .getResultList();
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateRandomRecipes(@RequestParam(defaultValue = "10") int count) {
        recipeDataGenerator.generateRandomRecipes(count);
        return ResponseEntity.ok("Generated " + count + " random recipes");
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        try {
            System.out.println("Received recipe: " + recipe.getName());
            System.out.println("Status: " + recipe.getStatus());
            System.out.println("Ingredients: " + (recipe.getIngredients() != null ? recipe.getIngredients().size() : 0));
            
            // Set timestamps to null to let lifecycle hooks handle them
            recipe.setCreatedAt(null);
            recipe.setUpdatedAt(null);
            
            // Process ingredients if provided
            if (recipe.getIngredients() != null && !recipe.getIngredients().isEmpty()) {
                List<Ingredient> processedIngredients = new ArrayList<>();
                for (Ingredient ingredient : recipe.getIngredients()) {
                    System.out.println("Processing ingredient: " + ingredient.getName() + " (id: " + ingredient.getId() + ")");
                    
                    // If ingredient has an ID, fetch it from database
                    if (ingredient.getId() != null) {
                        Ingredient existingIngredient = entityManager.find(Ingredient.class, ingredient.getId());
                        if (existingIngredient != null) {
                            System.out.println("Found existing ingredient by ID: " + existingIngredient.getName());
                            processedIngredients.add(existingIngredient);
                        }
                    } else {
                        // Check if ingredient with the same name exists
                        List<Ingredient> existingIngredients = entityManager.createQuery(
                                "SELECT i FROM Ingredient i WHERE i.name = :name", Ingredient.class)
                                .setParameter("name", ingredient.getName())
                                .getResultList();
                        
                        if (!existingIngredients.isEmpty()) {
                            System.out.println("Found existing ingredient by name: " + existingIngredients.get(0).getName());
                            processedIngredients.add(existingIngredients.get(0));
                        } else {
                            // Create new ingredient
                            System.out.println("Creating new ingredient: " + ingredient.getName());
                            Ingredient newIngredient = new Ingredient();
                            newIngredient.setName(ingredient.getName());
                            newIngredient.setCategory("Uncategorized");
                            entityManager.persist(newIngredient);
                            System.out.println("Created new ingredient with ID: " + newIngredient.getId());
                            processedIngredients.add(newIngredient);
                        }
                    }
                }
                // Set processed ingredients to recipe
                recipe.setIngredients(processedIngredients);
            } else {
                recipe.setIngredients(null);
            }
            
            // Persist recipe
            System.out.println("Persisting recipe: " + recipe.getName());
            entityManager.persist(recipe);
            System.out.println("Recipe persisted with ID: " + recipe.getId());
            
            return ResponseEntity.ok(recipe);
        } catch (Exception e) {
            System.err.println("Error creating recipe: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Recipe> updateRecipe(@PathVariable Long id, @RequestBody Recipe recipe) {
        try {
            System.out.println("Updating recipe ID: " + id);
            System.out.println("Recipe name: " + recipe.getName());
            System.out.println("Ingredients: " + (recipe.getIngredients() != null ? recipe.getIngredients().size() : 0));
            
            Recipe existingRecipe = entityManager.find(Recipe.class, id);
            if (existingRecipe == null) {
                System.err.println("Recipe not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            // Update basic fields
            existingRecipe.setName(recipe.getName());
            existingRecipe.setStatus(recipe.getStatus());
            existingRecipe.setPrepTime(recipe.getPrepTime());
            existingRecipe.setCookTime(recipe.getCookTime());
            existingRecipe.setServings(recipe.getServings());
            existingRecipe.setInstructions(recipe.getInstructions());
            
            // Process ingredients if provided
            if (recipe.getIngredients() != null && !recipe.getIngredients().isEmpty()) {
                List<Ingredient> processedIngredients = new ArrayList<>();
                for (Ingredient ingredient : recipe.getIngredients()) {
                    System.out.println("Processing ingredient: " + ingredient.getName() + " (id: " + ingredient.getId() + ")");
                    
                    // If ingredient has an ID, fetch it from database
                    if (ingredient.getId() != null) {
                        Ingredient existingIngredient = entityManager.find(Ingredient.class, ingredient.getId());
                        if (existingIngredient != null) {
                            System.out.println("Found existing ingredient by ID: " + existingIngredient.getName());
                            processedIngredients.add(existingIngredient);
                        }
                    } else {
                        // Check if ingredient with same name exists
                        List<Ingredient> existingIngredients = entityManager.createQuery(
                                "SELECT i FROM Ingredient i WHERE i.name = :name", Ingredient.class)
                                .setParameter("name", ingredient.getName())
                                .getResultList();
                        
                        if (!existingIngredients.isEmpty()) {
                            System.out.println("Found existing ingredient by name: " + existingIngredients.get(0).getName());
                            processedIngredients.add(existingIngredients.get(0));
                        } else {
                            // Create new ingredient
                            System.out.println("Creating new ingredient: " + ingredient.getName());
                            Ingredient newIngredient = new Ingredient();
                            newIngredient.setName(ingredient.getName());
                            newIngredient.setCategory("Uncategorized");
                            entityManager.persist(newIngredient);
                            System.out.println("Created new ingredient with ID: " + newIngredient.getId());
                            processedIngredients.add(newIngredient);
                        }
                    }
                }
                // Set processed ingredients to recipe
                existingRecipe.setIngredients(processedIngredients);
            } else {
                existingRecipe.setIngredients(null);
            }
            
            // Merge recipe
            System.out.println("Merging recipe: " + existingRecipe.getName());
            entityManager.merge(existingRecipe);
            System.out.println("Recipe updated successfully");
            
            return ResponseEntity.ok(existingRecipe);
        } catch (Exception e) {
            System.err.println("Error updating recipe: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        Recipe recipe = entityManager.find(Recipe.class, id);
        if (recipe == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Clear ingredients relationship to avoid foreign key constraint issues
        if (recipe.getIngredients() != null) {
            recipe.getIngredients().clear();
            entityManager.merge(recipe);
        }
        
        entityManager.remove(recipe);
        return ResponseEntity.noContent().build();
    }
}
