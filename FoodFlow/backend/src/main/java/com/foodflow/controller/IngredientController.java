package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ingredients")
public class IngredientController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping
    public ResponseEntity<List<Ingredient>> getAllIngredients() {
        List<Ingredient> ingredients = entityManager.createQuery(
                "SELECT i FROM Ingredient i", Ingredient.class)
                .getResultList();
        return ResponseEntity.ok(ingredients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> getIngredientById(@PathVariable Long id) {
        Ingredient ingredient = entityManager.find(Ingredient.class, id);
        if (ingredient == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ingredient);
    }

    @GetMapping("/by-name/{name}")
    public ResponseEntity<Ingredient> getIngredientByName(@PathVariable String name) {
        List<Ingredient> ingredients = entityManager.createQuery(
                "SELECT i FROM Ingredient i WHERE i.name = :name", Ingredient.class)
                .setParameter("name", name)
                .getResultList();
        if (ingredients.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ingredients.get(0));
    }
}