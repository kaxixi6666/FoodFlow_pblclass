package com.foodflow.controller;

import com.foodflow.model.MealPlan;
import com.foodflow.model.Recipe;
import com.foodflow.model.ShoppingListItem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/meal-plans")
public class MealPlanController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping
    public ResponseEntity<List<MealPlan>> getAllMealPlans(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            List<MealPlan> mealPlans;
            
            if (userId != null) {
                if (startDate != null && endDate != null) {
                    LocalDate start = LocalDate.parse(startDate);
                    LocalDate end = LocalDate.parse(endDate);
                    
                    mealPlans = entityManager.createQuery(
                            "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE (mp.recipe.userId = :userId OR mp.recipe.isPublic = true) AND mp.date BETWEEN :start AND :end", MealPlan.class)
                            .setParameter("userId", userId)
                            .setParameter("start", start)
                            .setParameter("end", end)
                            .getResultList();
                } else {
                    mealPlans = entityManager.createQuery(
                            "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE mp.recipe.userId = :userId", MealPlan.class)
                            .setParameter("userId", userId)
                            .getResultList();
                }
            } else {
                mealPlans = entityManager.createQuery(
                        "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe", MealPlan.class)
                        .getResultList();
            }
            
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            System.err.println("Error fetching meal plans: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/week")
    public ResponseEntity<List<MealPlan>> getMealPlansByWeek(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            List<MealPlan> mealPlans = entityManager.createQuery(
                    "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE mp.date BETWEEN :start AND :end", MealPlan.class)
                    .setParameter("start", start)
                    .setParameter("end", end)
                    .getResultList();
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            System.err.println("Error fetching meal plans by week: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<MealPlan>> getMealPlansByDate(@PathVariable String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            
            List<MealPlan> mealPlans = entityManager.createQuery(
                    "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE mp.date = :date", MealPlan.class)
                    .setParameter("date", localDate)
                    .getResultList();
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            System.err.println("Error fetching meal plans by date: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan mealPlan) {
        try {
            System.out.println("Creating meal plan:");
            System.out.println("  Date: " + mealPlan.getDate());
            System.out.println("  Day of week: " + mealPlan.getDayOfWeek());
            System.out.println("  Meal type: " + mealPlan.getMealType());
            System.out.println("  User ID: " + mealPlan.getUserId());
            System.out.println("  Recipe ID: " + (mealPlan.getRecipe() != null ? mealPlan.getRecipe().getId() : "null"));
            
            // Validate user ID
            if (mealPlan.getUserId() == null) {
                System.err.println("User ID is null");
                return ResponseEntity.badRequest().build();
            }
            
            // Validate date
            if (mealPlan.getDate() == null) {
                System.err.println("Date is null");
                return ResponseEntity.badRequest().build();
            }
            
            // Validate meal type
            if (mealPlan.getMealType() == null || mealPlan.getMealType().trim().isEmpty()) {
                System.err.println("Meal type is null or empty");
                return ResponseEntity.badRequest().build();
            }
            
            // Check for duplicate meal plan (user_id, date, meal_type)
            try {
                List<MealPlan> existingPlans = entityManager.createQuery(
                        "SELECT mp FROM MealPlan mp WHERE mp.userId = :userId AND mp.date = :date AND mp.mealType = :mealType", MealPlan.class)
                        .setParameter("userId", mealPlan.getUserId())
                        .setParameter("date", mealPlan.getDate())
                        .setParameter("mealType", mealPlan.getMealType())
                        .getResultList();
                
                if (!existingPlans.isEmpty()) {
                    System.err.println("Duplicate meal plan found for user " + mealPlan.getUserId() + 
                                   " on " + mealPlan.getDate() + " for " + mealPlan.getMealType());
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(existingPlans.get(0));
                }
            } catch (Exception e) {
                System.err.println("Error checking for duplicate meal plan: " + e.getMessage());
                // Continue with creation if check fails
            }
            
            // Fetch recipe from database
            if (mealPlan.getRecipe() != null && mealPlan.getRecipe().getId() != null) {
                try {
                    Recipe recipe = entityManager.find(Recipe.class, mealPlan.getRecipe().getId());
                    if (recipe == null) {
                        System.err.println("Recipe not found with ID: " + mealPlan.getRecipe().getId());
                        return ResponseEntity.notFound().build();
                    }
                    mealPlan.setRecipe(recipe);
                } catch (NumberFormatException e) {
                    System.err.println("Invalid recipe ID format: " + mealPlan.getRecipe().getId());
                    return ResponseEntity.badRequest().build();
                }
            } else {
                System.err.println("Recipe or Recipe ID is null");
                return ResponseEntity.badRequest().build();
            }
            
            // Set timestamps to null to let lifecycle hooks handle them
            mealPlan.setCreatedAt(null);
            mealPlan.setUpdatedAt(null);
            
            // Persist meal plan
            entityManager.persist(mealPlan);
            System.out.println("Meal plan created with ID: " + mealPlan.getId());
            
            return ResponseEntity.ok(mealPlan);
        } catch (PersistenceException e) {
            System.err.println("Persistence exception creating meal plan: " + e.getMessage());
            e.printStackTrace();
            
            // Check for unique constraint violation (兼容 H2 和 PostgreSQL)
            if (e.getCause() != null && e.getCause().getMessage() != null) {
                String message = e.getCause().getMessage().toLowerCase();
                if (message.contains("unique constraint") || message.contains("duplicate key") || 
                    message.contains("unique") || message.contains("duplicate")) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(null);
                }
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            System.err.println("Error creating meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MealPlan> updateMealPlan(@PathVariable Long id, @RequestBody MealPlan mealPlan) {
        try {
            MealPlan existingMealPlan = entityManager.find(MealPlan.class, id);
            if (existingMealPlan == null) {
                return ResponseEntity.notFound().build();
            }
            
            existingMealPlan.setDate(mealPlan.getDate());
            existingMealPlan.setDayOfWeek(mealPlan.getDayOfWeek());
            existingMealPlan.setMealType(mealPlan.getMealType());
            
            // Update recipe if provided
            if (mealPlan.getRecipe() != null && mealPlan.getRecipe().getId() != null) {
                Recipe recipe = entityManager.find(Recipe.class, mealPlan.getRecipe().getId());
                if (recipe != null) {
                    existingMealPlan.setRecipe(recipe);
                }
            }
            
            entityManager.merge(existingMealPlan);
            return ResponseEntity.ok(existingMealPlan);
        } catch (Exception e) {
            System.err.println("Error updating meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteMealPlan(@PathVariable Long id) {
        try {
            MealPlan mealPlan = entityManager.find(MealPlan.class, id);
            if (mealPlan == null) {
                return ResponseEntity.notFound().build();
            }
            
            entityManager.remove(mealPlan);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/shopping-list")
    public ResponseEntity<List<ShoppingListItem>> getShoppingList() {
        try {
            List<ShoppingListItem> items = entityManager.createQuery(
                    "SELECT sli FROM ShoppingListItem sli", ShoppingListItem.class)
                    .getResultList();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error fetching shopping list: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/shopping-list")
    @Transactional
    public ResponseEntity<ShoppingListItem> addShoppingListItem(@RequestBody ShoppingListItem item) {
        try {
            System.out.println("Adding shopping list item: " + item.getName());
            
            // Set timestamps to null to let lifecycle hooks handle them
            item.setCreatedAt(null);
            item.setUpdatedAt(null);
            
            entityManager.persist(item);
            System.out.println("Shopping list item created with ID: " + item.getId());
            
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            System.err.println("Error adding shopping list item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/shopping-list/{id}")
    @Transactional
    public ResponseEntity<ShoppingListItem> updateShoppingListItem(
            @PathVariable Long id, @RequestBody ShoppingListItem item) {
        try {
            ShoppingListItem existingItem = entityManager.find(ShoppingListItem.class, id);
            if (existingItem == null) {
                return ResponseEntity.notFound().build();
            }
            
            existingItem.setName(item.getName());
            existingItem.setCategory(item.getCategory());
            existingItem.setChecked(item.getChecked());
            
            entityManager.merge(existingItem);
            return ResponseEntity.ok(existingItem);
        } catch (Exception e) {
            System.err.println("Error updating shopping list item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/shopping-list/{id}")
    @Transactional
    public ResponseEntity<Void> deleteShoppingListItem(@PathVariable Long id) {
        try {
            ShoppingListItem item = entityManager.find(ShoppingListItem.class, id);
            if (item == null) {
                return ResponseEntity.notFound().build();
            }
            
            entityManager.remove(item);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting shopping list item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/shopping-list")
    @Transactional
    public ResponseEntity<Void> clearShoppingList() {
        try {
            entityManager.createQuery("DELETE FROM ShoppingListItem").executeUpdate();
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error clearing shopping list: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
