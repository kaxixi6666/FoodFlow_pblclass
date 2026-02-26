package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import com.foodflow.model.Recipe;
import com.foodflow.model.RecipeLike;
import com.foodflow.model.Notification;
import com.foodflow.model.User;
import com.foodflow.service.RecipeDataGenerator;
import com.foodflow.service.RecipeLikeService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.HttpStatus;
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
    private final RecipeLikeService recipeLikeService;

    public RecipeController(RecipeDataGenerator recipeDataGenerator, RecipeLikeService recipeLikeService) {
        this.recipeDataGenerator = recipeDataGenerator;
        this.recipeLikeService = recipeLikeService;
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
            // Always set isPublic based on status to ensure consistency
            // 总是根据状态设置isPublic以确保一致性
            recipe.setIsPublic("public".equals(recipe.getStatus()));
            
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
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Deleting recipe with ID: " + id + " for user: " + userId);

            Recipe recipe = entityManager.createQuery(
                "SELECT r FROM Recipe r WHERE r.id = :id AND r.userId = :userId", Recipe.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst()
                .orElse(null);
            
            if (recipe == null) {
                System.err.println("Recipe not found with ID: " + id + " for user: " + userId);
                return ResponseEntity.notFound().build();
            }
            
            // Delete meal plans that reference this recipe
            int mealPlansDeleted = entityManager.createQuery(
                "DELETE FROM MealPlan mp WHERE mp.recipe.id = :recipeId")
                .setParameter("recipeId", id)
                .executeUpdate();
            System.out.println("Deleted " + mealPlansDeleted + " meal plans referencing recipe " + id);
            
            // Delete recipe likes that reference this recipe
            int likesDeleted = entityManager.createQuery(
                "DELETE FROM RecipeLike rl WHERE rl.recipeId = :recipeId")
                .setParameter("recipeId", id)
                .executeUpdate();
            System.out.println("Deleted " + likesDeleted + " recipe likes referencing recipe " + id);
            
            // Delete notifications that reference this recipe
            int notificationsDeleted = entityManager.createQuery(
                "DELETE FROM Notification n WHERE n.recipeId = :recipeId")
                .setParameter("recipeId", id)
                .executeUpdate();
            System.out.println("Deleted " + notificationsDeleted + " notifications referencing recipe " + id);
            
            // Clear ingredients relationship to avoid foreign key constraint issues
            if (recipe.getIngredients() != null) {
                recipe.getIngredients().clear();
                entityManager.merge(recipe);
                entityManager.flush();
                System.out.println("Cleared ingredients for recipe " + id);
            }
            
            // Delete the recipe
            entityManager.remove(recipe);
            System.out.println("Successfully deleted recipe " + id);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting recipe: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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

            // Use service layer to handle like/unlike toggle
            // 使用服务层处理点赞/取消点赞切换
            RecipeLikeService.LikeResult result = recipeLikeService.toggleLike(id, userId);
            
            // 即使有错误（如通知创建失败），只要点赞操作本身成功，就返回成功响应
            // Even if there are errors (e.g., notification creation failed), return success response as long as the like operation itself succeeded
            return ResponseEntity.ok(new LikeResponse(result.isLiked(), result.getLikeCount()));
        } catch (Exception e) {
            System.err.println("Error liking/unliking recipe: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/like-count")
    public ResponseEntity<?> getLikeCount(
        @PathVariable Long id
    ) {
        try {
            int actualLikeCount = recipeLikeService.getActualLikeCount(id);
            return ResponseEntity.ok(new LikeCountResponse(actualLikeCount));
        } catch (Exception e) {
            System.err.println("Error getting like count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    // Response class for like count endpoint
    private static class LikeCountResponse {
        private int likeCount;

        public LikeCountResponse(int likeCount) {
            this.likeCount = likeCount;
        }

        public int getLikeCount() {
            return likeCount;
        }
    }
}