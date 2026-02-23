package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import com.foodflow.model.Inventory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping
    @Transactional
    public ResponseEntity<Inventory> addToInventory(
        @RequestBody InventoryRequest request,
        @RequestHeader("X-User-Id") Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Always create a new ingredient record (no duplicate checking)
        Ingredient ingredient = new Ingredient();
        ingredient.setName(request.getName());
        ingredient.setCategory(request.getCategory());
        ingredient.setDescription(request.getDescription());
        entityManager.persist(ingredient);

        // Always create a new inventory record (no duplicate checking)
        // Each item has a different creation time and should be preserved separately
        Inventory inventory = new Inventory();
        inventory.setIngredient(ingredient);
        inventory.setUserId(userId);
        inventory.setLastUpdated(LocalDateTime.now());
        inventory.setCreatedAt(LocalDateTime.now());
        entityManager.persist(inventory);

        return ResponseEntity.ok(inventory);
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getInventory(@RequestHeader("X-User-Id") Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Inventory> inventories = entityManager.createQuery(
            "SELECT i FROM Inventory i WHERE i.userId = :userId ORDER BY i.id", Inventory.class
        ).setParameter("userId", userId)
        .getResultList();

        List<InventoryResponse> response = new ArrayList<>();
        ZoneId tokyoZone = ZoneId.of("Asia/Tokyo");
        for (Inventory inventory : inventories) {
            InventoryResponse item = new InventoryResponse();
            item.setId(inventory.getId());
            item.setName(inventory.getIngredient().getName());
            item.setCategory(inventory.getIngredient().getCategory());
            // Convert to Tokyo time
            ZonedDateTime tokyoTime = inventory.getLastUpdated().atZone(ZoneId.systemDefault()).withZoneSameInstant(tokyoZone);
            // Format with pattern: yyyy-MM-dd HH:mm:ss
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            item.setLastUpdated(tokyoTime.format(formatter));
            response.add(item);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Inventory> updateInventory(
        @PathVariable Long id,
        @RequestBody InventoryUpdateRequest request,
        @RequestHeader("X-User-Id") Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        Inventory inventory = entityManager.createQuery(
            "SELECT i FROM Inventory i WHERE i.id = :id AND i.userId = :userId", Inventory.class
        ).setParameter("id", id)
        .setParameter("userId", userId)
        .getResultList()
        .stream()
        .findFirst()
        .orElse(null);

        if (inventory == null) {
            return ResponseEntity.notFound().build();
        }

        inventory.setLastUpdated(LocalDateTime.now());
        entityManager.merge(inventory);
        return ResponseEntity.ok(inventory);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteInventory(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        Inventory inventory = entityManager.createQuery(
            "SELECT i FROM Inventory i WHERE i.id = :id AND i.userId = :userId", Inventory.class
        ).setParameter("id", id)
        .setParameter("userId", userId)
        .getResultList()
        .stream()
        .findFirst()
        .orElse(null);

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

        // Getters and setters
        public Long getIngredientId() { return ingredientId; }
        public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class InventoryUpdateRequest {
        // Empty class for future use
    }

    public static class InventoryResponse {
        private Long id;
        private String name;
        private String category;
        private String lastUpdated;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
    }
}
