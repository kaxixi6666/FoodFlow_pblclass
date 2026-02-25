package com.foodflow.controller;

import com.foodflow.model.Ingredient;
import com.foodflow.model.Inventory;
import com.foodflow.service.ZhipuAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @PersistenceContext
    private EntityManager entityManager;

    private final ZhipuAIService zhipuAIService;

    public InventoryController(ZhipuAIService zhipuAIService) {
        this.zhipuAIService = zhipuAIService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> addToInventory(
        @RequestBody InventoryRequest request,
        @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        try {
            // Validate userId
            if (userId == null) {
                System.err.println("Error: X-User-Id header is missing");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "X-User-Id header is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            // Validate request
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                System.err.println("Error: Ingredient name is required");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Ingredient name is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            System.out.println("Adding to inventory - userId: " + userId + ", name: " + request.getName());

            // Always create a new ingredient record (no duplicate checking)
            Ingredient ingredient = new Ingredient();
            ingredient.setName(request.getName().trim());
            ingredient.setCategory(request.getCategory() != null ? request.getCategory().trim() : "Uncategorized");
            ingredient.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
            entityManager.persist(ingredient);
            entityManager.flush(); // Flush to get ID
            System.out.println("Created ingredient with ID: " + ingredient.getId());

            // Always create a new inventory record (no duplicate checking)
            // Each item has a different creation time and should be preserved separately
            Inventory inventory = new Inventory();
            inventory.setIngredient(ingredient);
            inventory.setUserId(userId);
            inventory.setLastUpdated(LocalDateTime.now());
            inventory.setCreatedAt(LocalDateTime.now());
            entityManager.persist(inventory);
            entityManager.flush(); // Flush to ensure it's persisted
            System.out.println("Created inventory with ID: " + inventory.getId());

            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            System.err.println("Error adding to inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to add to inventory: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/batch")
    @Transactional
    public ResponseEntity<?> batchAddToInventory(
        @RequestBody BatchInventoryRequest batchRequest,
        @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        try {
            // Validate userId
            if (userId == null) {
                System.err.println("Error: X-User-Id header is missing");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "X-User-Id header is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            // Validate request
            if (batchRequest.getItems() == null || batchRequest.getItems().isEmpty()) {
                System.err.println("Error: Items list is empty");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Items list is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            System.out.println("Batch adding to inventory - userId: " + userId + ", items: " + batchRequest.getItems().size());

            List<InventoryResponse> responses = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();

            for (InventoryRequest itemRequest : batchRequest.getItems()) {
                // Validate each item
                if (itemRequest.getName() == null || itemRequest.getName().trim().isEmpty()) {
                    System.err.println("Error: Ingredient name is required");
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", "Ingredient name is required");
                    error.put("code", 400);
                    return ResponseEntity.badRequest().body(error);
                }

                // Create ingredient
                Ingredient ingredient = new Ingredient();
                ingredient.setName(itemRequest.getName().trim());
                ingredient.setCategory(itemRequest.getCategory() != null ? itemRequest.getCategory().trim() : "Uncategorized");
                ingredient.setDescription(itemRequest.getDescription() != null ? itemRequest.getDescription().trim() : null);
                entityManager.persist(ingredient);

                // Create inventory
                Inventory inventory = new Inventory();
                inventory.setIngredient(ingredient);
                inventory.setUserId(userId);
                inventory.setLastUpdated(now);
                inventory.setCreatedAt(now);
                entityManager.persist(inventory);

                // Add to response
                InventoryResponse response = new InventoryResponse();
                response.setId(inventory.getId());
                response.setName(ingredient.getName());
                response.setCategory(ingredient.getCategory());
                ZoneId tokyoZone = ZoneId.of("Asia/Tokyo");
                ZonedDateTime tokyoTime = now.atZone(ZoneId.systemDefault()).withZoneSameInstant(tokyoZone);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                response.setLastUpdated(tokyoTime.format(formatter));
                responses.add(response);
            }

            entityManager.flush();
            System.out.println("Successfully created " + responses.size() + " inventory items");

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Successfully added " + responses.size() + " items to inventory");
            result.put("items", responses);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error batch adding to inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to batch add to inventory: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getInventory(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            // Validate userId
            if (userId == null) {
                System.err.println("Error: X-User-Id header is missing");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "X-User-Id header is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
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
        } catch (Exception e) {
            System.err.println("Error getting inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get inventory: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateInventory(
        @PathVariable Long id,
        @RequestBody InventoryUpdateRequest request,
        @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        try {
            // Validate userId
            if (userId == null) {
                System.err.println("Error: X-User-Id header is missing");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "X-User-Id header is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            Inventory inventory = entityManager.createQuery(
                "SELECT i FROM Inventory i WHERE i.id = :id AND i.userId = :userId", Inventory.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst()
                .orElse(null);

            if (inventory == null) {
                System.err.println("Inventory not found with ID: " + id + " for user: " + userId);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Inventory not found");
                error.put("code", 404);
                return ResponseEntity.notFound().build();
            }

            inventory.setLastUpdated(LocalDateTime.now());
            entityManager.merge(inventory);
            entityManager.flush();
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            System.err.println("Error updating inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update inventory: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteInventory(
        @PathVariable Long id,
        @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        try {
            // Validate userId
            if (userId == null) {
                System.err.println("Error: X-User-Id header is missing");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "X-User-Id header is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            Inventory inventory = entityManager.createQuery(
                "SELECT i FROM Inventory i WHERE i.id = :id AND i.userId = :userId", Inventory.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst()
                .orElse(null);

            if (inventory != null) {
                entityManager.remove(inventory);
                entityManager.flush();
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete inventory: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        }
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

    public static class BatchInventoryRequest {
        private List<InventoryRequest> items;

        // Getters and setters
        public List<InventoryRequest> getItems() { return items; }
        public void setItems(List<InventoryRequest> items) { this.items = items; }
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

    /**
     * Detect text from image and translate to English
     * @param image Uploaded image file
     * @param userId User ID
     * @param scenario Analysis scenario (receipt or fridge)
     * @return Translated English result
     */
    @PostMapping("/detect")
    public ResponseEntity<?> detectInventory(
        @RequestParam("image") MultipartFile image,
        @RequestHeader(value = "X-User-Id", required = false) Long userId,
        @RequestParam(value = "scenario", defaultValue = "receipt") String scenario
    ) {
        try {
            // Validate image
            if (image == null || image.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Image file is required");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            // Validate image size (≤ 10MB)
            if (image.getSize() > 10 * 1024 * 1024) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Image file size must be ≤ 10MB");
                error.put("code", 400);
                return ResponseEntity.badRequest().body(error);
            }

            // Get image format
            String originalFilename = image.getOriginalFilename();
            String imageFormat = zhipuAIService.getImageFormat(originalFilename);

            // Read image data
            byte[] imageData = image.getBytes();

            // Call ZhipuAI service for recognition and translation
            String result = zhipuAIService.detectAndTranslateImage(imageData, imageFormat, scenario);

            // Return result
            Map<String, Object> response = new HashMap<>();
            response.put("result", result);
            response.put("scenario", scenario);
            
            // Convert result to frontend expected format
            if ("fridge".equalsIgnoreCase(scenario)) {
                // For fridge scenario, result is JSON array: ["ingredient1", "ingredient2"]
                try {
                    JSONArray ingredientsArray = JSON.parseArray(result);
                    List<Map<String, Object>> detectedItems = new ArrayList<>();
                    for (int i = 0; i < ingredientsArray.size(); i++) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", i + 1);
                        item.put("name", ingredientsArray.getString(i));
                        detectedItems.add(item);
                    }
                    response.put("detectedItems", detectedItems);
                } catch (Exception e) {
                    System.err.println("Error parsing fridge result: " + e.getMessage());
                    response.put("detectedItems", new ArrayList<>());
                }
            } else {
                // For receipt scenario, result is JSON array: [{"name":"ingredient name","quantity":"quantity"}]
                try {
                    JSONArray itemsArray = JSON.parseArray(result);
                    List<Map<String, Object>> detectedItems = new ArrayList<>();
                    for (int i = 0; i < itemsArray.size(); i++) {
                        JSONObject itemObj = itemsArray.getJSONObject(i);
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", i + 1);
                        item.put("name", itemObj.getString("name"));
                        item.put("quantity", itemObj.getString("quantity"));
                        detectedItems.add(item);
                    }
                    response.put("detectedItems", detectedItems);
                } catch (Exception e) {
                    System.err.println("Error parsing receipt result: " + e.getMessage());
                    response.put("detectedItems", new ArrayList<>());
                }
            }
            
            if (userId != null) {
                response.put("userId", userId);
            }
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.err.println("Error detecting inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to detect inventory: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            error.put("code", 500);
            return ResponseEntity.status(500).body(error);
        }
    }
}
