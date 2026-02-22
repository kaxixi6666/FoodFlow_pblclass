package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import com.foodflow.model.Inventory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping
    @Transactional
    public ResponseEntity<Inventory> addToInventory(@RequestBody InventoryRequest request) {
        // Create or get ingredient
        List<Ingredient> existingIngredients = entityManager.createQuery(
            "SELECT i FROM Ingredient i WHERE i.name = :name", Ingredient.class
        ).setParameter("name", request.getName()).getResultList();

        Ingredient ingredient;
        if (!existingIngredients.isEmpty()) {
            ingredient = existingIngredients.get(0);
        } else {
            ingredient = new Ingredient();
            ingredient.setName(request.getName());
            ingredient.setCategory(request.getCategory());
            ingredient.setDescription(request.getDescription());
            entityManager.persist(ingredient);
        }

        // Create inventory item
        Inventory inventory = new Inventory();
        inventory.setIngredient(ingredient);
        inventory.setQuantity(request.getQuantity());
        inventory.setUnit(request.getUnit());
        inventory.setLastUpdated(LocalDateTime.now());
        inventory.setCreatedAt(LocalDateTime.now());

        entityManager.persist(inventory);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getInventory() {
        List<Inventory> inventories = entityManager.createQuery(
            "SELECT i FROM Inventory i ORDER BY i.id", Inventory.class
        ).getResultList();

        List<InventoryResponse> response = new ArrayList<>();
        for (Inventory inventory : inventories) {
            InventoryResponse item = new InventoryResponse();
            item.setId(inventory.getId());
            item.setName(inventory.getIngredient().getName());
            item.setCategory(inventory.getIngredient().getCategory());
            item.setQuantity(inventory.getQuantity());
            item.setUnit(inventory.getUnit());
            item.setLastUpdated(inventory.getLastUpdated().toString());
            response.add(item);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestBody InventoryUpdateRequest request) {
        Inventory inventory = entityManager.find(Inventory.class, id);
        if (inventory == null) {
            return ResponseEntity.notFound().build();
        }

        inventory.setQuantity(request.getQuantity());
        inventory.setLastUpdated(LocalDateTime.now());
        entityManager.merge(inventory);
        return ResponseEntity.ok(inventory);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        Inventory inventory = entityManager.find(Inventory.class, id);
        if (inventory != null) {
            entityManager.remove(inventory);
        }
        return ResponseEntity.noContent().build();
    }

    // Request and response classes
    public static class InventoryRequest {
        private Long ingredientId;
        private String name;
        private String category;
        private String description;
        private double quantity;
        private String unit;

        // Getters and setters
        public Long getIngredientId() { return ingredientId; }
        public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public double getQuantity() { return quantity; }
        public void setQuantity(double quantity) { this.quantity = quantity; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
    }

    public static class InventoryUpdateRequest {
        private double quantity;

        public double getQuantity() { return quantity; }
        public void setQuantity(double quantity) { this.quantity = quantity; }
    }

    public static class InventoryResponse {
        private Long id;
        private String name;
        private String category;
        private double quantity;
        private String unit;
        private String lastUpdated;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public double getQuantity() { return quantity; }
        public void setQuantity(double quantity) { this.quantity = quantity; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
    }
}
