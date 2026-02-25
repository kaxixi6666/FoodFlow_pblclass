package com.foodflow.controller;

import com.foodflow.model.MealPlan;
import com.foodflow.model.Recipe;
import com.foodflow.model.ShoppingListItem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
    public ResponseEntity<List<MealPlan>> getAllMealPlans(@RequestParam(required = false) Long userId) {
        List<MealPlan> mealPlans;
        
        if (userId != null) {
            mealPlans = entityManager.createQuery(
                    "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE mp.recipe.userId = :userId", MealPlan.class)
                    .setParameter("userId", userId)
                    .getResultList();
        } else {
            mealPlans = entityManager.createQuery(
                    "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe", MealPlan.class)
                    .getResultList();
        }
        
        return ResponseEntity.ok(mealPlans);
    }

    @GetMapping("/week")
    public ResponseEntity<List<MealPlan>> getMealPlansByWeek(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        List<MealPlan> mealPlans = entityManager.createQuery(
                "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE mp.date BETWEEN :start AND :end", MealPlan.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
        return ResponseEntity.ok(mealPlans);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<MealPlan>> getMealPlansByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        
        List<MealPlan> mealPlans = entityManager.createQuery(
                "SELECT mp FROM MealPlan mp JOIN FETCH mp.recipe WHERE mp.date = :date", MealPlan.class)
                .setParameter("date", localDate)
                .getResultList();
        return ResponseEntity.ok(mealPlans);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan mealPlan) {
        try {
            System.out.println("Creating meal plan:");
            System.out.println("  Date: " + mealPlan.getDate());
            System.out.println("  Day of week: " + mealPlan.getDayOfWeek());
            System.out.println("  Meal type: " + mealPlan.getMealType());
            System.out.println("  Recipe ID: " + (mealPlan.getRecipe() != null ? mealPlan.getRecipe().getId() : "null"));
            
            // Fetch the recipe from database
            if (mealPlan.getRecipe() != null && mealPlan.getRecipe().getId() != null) {
                Recipe recipe = entityManager.find(Recipe.class, mealPlan.getRecipe().getId());
                if (recipe == null) {
                    System.err.println("Recipe not found with ID: " + mealPlan.getRecipe().getId());
                    return ResponseEntity.notFound().build();
                }
                mealPlan.setRecipe(recipe);
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
        } catch (Exception e) {
            System.err.println("Error creating meal plan: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MealPlan> updateMealPlan(@PathVariable Long id, @RequestBody MealPlan mealPlan) {
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
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteMealPlan(@PathVariable Long id) {
        MealPlan mealPlan = entityManager.find(MealPlan.class, id);
        if (mealPlan == null) {
            return ResponseEntity.notFound().build();
        }
        
        entityManager.remove(mealPlan);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/shopping-list")
    public ResponseEntity<List<ShoppingListItem>> getShoppingList() {
        List<ShoppingListItem> items = entityManager.createQuery(
                "SELECT sli FROM ShoppingListItem sli", ShoppingListItem.class)
                .getResultList();
        return ResponseEntity.ok(items);
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
            throw e;
        }
    }

    @PutMapping("/shopping-list/{id}")
    @Transactional
    public ResponseEntity<ShoppingListItem> updateShoppingListItem(
            @PathVariable Long id, @RequestBody ShoppingListItem item) {
        ShoppingListItem existingItem = entityManager.find(ShoppingListItem.class, id);
        if (existingItem == null) {
            return ResponseEntity.notFound().build();
        }
        
        existingItem.setName(item.getName());
        existingItem.setCategory(item.getCategory());
        existingItem.setChecked(item.getChecked());
        
        entityManager.merge(existingItem);
        return ResponseEntity.ok(existingItem);
    }

    @DeleteMapping("/shopping-list/{id}")
    @Transactional
    public ResponseEntity<Void> deleteShoppingListItem(@PathVariable Long id) {
        ShoppingListItem item = entityManager.find(ShoppingListItem.class, id);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        
        entityManager.remove(item);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/shopping-list")
    @Transactional
    public ResponseEntity<Void> clearShoppingList() {
        entityManager.createQuery("DELETE FROM ShoppingListItem").executeUpdate();
        return ResponseEntity.noContent().build();
    }
}