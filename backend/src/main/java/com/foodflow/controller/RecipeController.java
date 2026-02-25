package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import com.foodflow.model.Recipe;
import com.foodflow.model.RecipeLike;
import com.foodflow.model.Notification;
import com.foodflow.model.User;
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
    public ResponseEntity<List<Recipe>> getAllRecipes(@RequestHeader("X-User-Id") Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Fetching recipes for user: " + userId);
            List<Recipe> recipes = entityManager.createQuery(
                "SELECT r FROM Recipe r LEFT JOIN FETCH r.ingredients WHERE r.userId = :userId ORDER BY r.id", Recipe.class)
                .setParameter("userId", userId)
                .getResultList();
            System.out.println("Found " + recipes.size() + " recipes for user: " + userId);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("Error fetching recipes: " + e.getMessage());
            e.printStackTrace();
            // Return empty list as fallback
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<Recipe>> getPublicRecipes() {
        try {
            System.out.println("Fetching public recipes...");
            List<Recipe> recipes = entityManager.createQuery(
                "SELECT r FROM Recipe r LEFT JOIN FETCH r.ingredients WHERE r.isPublic = true ORDER BY r.id", Recipe.class)
                .getResultList();
            System.out.println("Found " + recipes.size() + " public recipes");
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("Error fetching public recipes: " + e.getMessage());
            e.printStackTrace();
            // Return empty list as fallback
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Recipe>> getRecipesByStatus(
        @PathVariable String status,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Fetching recipes with status: " + status + " for user: " + userId);
            List<Recipe> recipes = entityManager.createQuery(
                    "SELECT r FROM Recipe r LEFT JOIN FETCH r.ingredients WHERE r.status = :status AND r.userId = :userId", Recipe.class)
                    .setParameter("status", status)
                    .setParameter("userId", userId)
                    .getResultList();
            System.out.println("Found " + recipes.size() + " recipes with status: " + status);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("Error fetching recipes by status: " + e.getMessage());
            e.printStackTrace();
            // Return empty list as fallback
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateRandomRecipes(@RequestParam(defaultValue = "10") int count) {
        recipeDataGenerator.generateRandomRecipes(count);
        return ResponseEntity.ok("Generated " + count + " random recipes");
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Recipe> createRecipe(
        @RequestBody Recipe recipe,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Received recipe: " + recipe.getName());
            System.out.println("Status: " + recipe.getStatus());
            System.out.println("Ingredients: " + (recipe.getIngredients() != null ? recipe.getIngredients().size() : 0));
            
            // Set userId and isPublic based on status
            recipe.setUserId(userId);
            if (recipe.getIsPublic() == null) {
                // Set isPublic based on status
                recipe.setIsPublic("public".equals(recipe.getStatus()));
            }
            
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
            entityManager.flush();
            System.out.println("Recipe persisted with ID: " + recipe.getId());
            
            // Refresh to ensure all relationships are loaded
            entityManager.refresh(recipe);
            
            return ResponseEntity.ok(recipe);
        } catch (Exception e) {
            System.err.println("Error creating recipe: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Recipe> updateRecipe(
        @PathVariable Long id,
        @RequestBody Recipe recipe,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Updating recipe ID: " + id);
            System.out.println("Recipe name: " + recipe.getName());
            System.out.println("Ingredients: " + (recipe.getIngredients() != null ? recipe.getIngredients().size() : 0));
            
            Recipe existingRecipe = entityManager.createQuery(
                "SELECT r FROM Recipe r WHERE r.id = :id AND r.userId = :userId", Recipe.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst()
                .orElse(null);
            
            if (existingRecipe == null) {
                System.err.println("Recipe not found with ID: " + id + " for user: " + userId);
                return ResponseEntity.notFound().build();
            }
            
            // Update basic fields
            existingRecipe.setName(recipe.getName());
            existingRecipe.setStatus(recipe.getStatus());
            existingRecipe.setPrepTime(recipe.getPrepTime());
            existingRecipe.setCookTime(recipe.getCookTime());
            existingRecipe.setServings(recipe.getServings());
            existingRecipe.setInstructions(recipe.getInstructions());
            existingRecipe.setNote(recipe.getNote());
            
            // Update isPublic based on status
            existingRecipe.setIsPublic("public".equals(recipe.getStatus()));
            System.out.println("Updated isPublic to: " + existingRecipe.getIsPublic() + " based on status: " + recipe.getStatus());
            
            // Clear existing ingredients
            if (existingRecipe.getIngredients() != null) {
                existingRecipe.getIngredients().clear();
            }
            
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
                // Add processed ingredients to recipe
                for (Ingredient ingredient : processedIngredients) {
                    existingRecipe.getIngredients().add(ingredient);
                }
            }
            
            // Merge recipe
            System.out.println("Merging recipe: " + existingRecipe.getName());
            entityManager.merge(existingRecipe);
            entityManager.flush();
            System.out.println("Recipe updated successfully");
            
            // Refresh to get updated data
            entityManager.refresh(existingRecipe);
            
            return ResponseEntity.ok(existingRecipe);
        } catch (Exception e) {
            System.err.println("Error updating recipe: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteRecipe(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        Recipe recipe = entityManager.createQuery(
            "SELECT r FROM Recipe r WHERE r.id = :id AND r.userId = :userId", Recipe.class)
            .setParameter("id", id)
            .setParameter("userId", userId)
            .getResultList()
            .stream()
            .findFirst()
            .orElse(null);
        
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

    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likeRecipe(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Fetch recipe
            Recipe recipe = entityManager.find(Recipe.class, id);
            if (recipe == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if user has already liked this recipe
            List<RecipeLike> existingLikes = entityManager.createQuery(
                "SELECT rl FROM RecipeLike rl WHERE rl.userId = :userId AND rl.recipeId = :recipeId", RecipeLike.class)
                .setParameter("userId", userId)
                .setParameter("recipeId", id)
                .getResultList();

            if (existingLikes.isEmpty()) {
                // User has not liked this recipe yet - perform like action
                System.out.println("User " + userId + " liking recipe " + id);

                // Create recipe like record
                RecipeLike recipeLike = new RecipeLike();
                recipeLike.setUserId(userId);
                recipeLike.setRecipeId(id);
                entityManager.persist(recipeLike);

                // Increment like count (only on first like)
                recipe.setLikeCount((recipe.getLikeCount() != null ? recipe.getLikeCount() : 0) + 1);
                entityManager.merge(recipe);

                // Create notification for recipe author (only on first like)
                if (recipe.getUserId() != null && !recipe.getUserId().equals(userId)) {
                    User author = entityManager.find(User.class, recipe.getUserId());
                    if (author != null) {
                        User liker = entityManager.find(User.class, userId);
                        String likerName = liker != null ? liker.getUsername() : "Someone";
                        
                        Notification notification = new Notification();
                        notification.setUserId(recipe.getUserId());
                        notification.setMessage(likerName + " liked your recipe '" + recipe.getName() + "'.");
                        notification.setRecipeId(id);
                        notification.setIsRead(false);
                        entityManager.persist(notification);
                        
                        System.out.println("Created notification for user " + recipe.getUserId());
                    }
                }

                return ResponseEntity.ok(new LikeResponse(true, recipe.getLikeCount()));
            } else {
                // User has already liked this recipe - perform unlike action
                System.out.println("User " + userId + " unliking recipe " + id);

                // Delete recipe like record
                entityManager.createQuery(
                    "DELETE FROM RecipeLike rl WHERE rl.userId = :userId AND rl.recipeId = :recipeId")
                    .setParameter("userId", userId)
                    .setParameter("recipeId", id)
                    .executeUpdate();

                // Do NOT decrement like count (as per requirements)
                // Do NOT delete any notifications

                return ResponseEntity.ok(new LikeResponse(false, recipe.getLikeCount()));
            }
        } catch (Exception e) {
            System.err.println("Error liking/unliking recipe: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Response class for like endpoint
    private static class LikeResponse {
        private boolean liked;
        private int likeCount;

        public LikeResponse(boolean liked, int likeCount) {
            this.liked = liked;
            this.likeCount = likeCount;
        }

        public boolean isLiked() {
            return liked;
        }

        public int getLikeCount() {
            return likeCount;
        }
    }
}
