package com.foodflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IngredientRecognitionService {

    @Value("${openai.model}")
    private String model;

    @Value("${openai.temperature}")
    private double temperature;

    public IngredientRecognitionService() {
    }

    public List<RecognizedIngredient> recognizeIngredientsFromText(String text) {
        // Temporarily return mock data, actual OpenAI API integration can be added later
        return getMockIngredients();
    }

    public List<RecognizedIngredient> recognizeIngredientsFromImageDescription(String imageDescription) {
        // Temporarily return mock data, actual OpenAI API integration can be added later
        return getMockIngredients();
    }

    private List<RecognizedIngredient> getMockIngredients() {
        List<RecognizedIngredient> ingredients = new ArrayList<>();
        ingredients.add(new RecognizedIngredient("Tomatoes", "Vegetables"));
        ingredients.add(new RecognizedIngredient("Cheddar Cheese", "Dairy"));
        ingredients.add(new RecognizedIngredient("Chicken Breast", "Meat"));
        return ingredients;
    }

    private String createRecognitionPrompt(String text) {
        return "Analyze the following text and identify all food ingredients mentioned. " +
                "For each ingredient, provide: name and category. " +
                "Format the output as JSON with an array of objects, each containing: name, category.\n\n" +
                "Text: " + text + "\n\n" +
                "Example output:\n" +
                "[\n" +
                "  {\"name\": \"Tomatoes\", \"category\": \"Vegetables\"},\n" +
                "  {\"name\": \"Cheddar Cheese\", \"category\": \"Dairy\"}\n" +
                "]";
    }

    private String createImageRecognitionPrompt(String imageDescription) {
        return "Based on the following image description, identify all food ingredients that might be present. " +
                "For each ingredient, provide: name and category. " +
                "Format the output as JSON with an array of objects, each containing: name, category.\n\n" +
                "Image description: " + imageDescription + "\n\n" +
                "Example output:\n" +
                "[\n" +
                "  {\"name\": \"Tomatoes\", \"category\": \"Vegetables\"},\n" +
                "  {\"name\": \"Lettuce\", \"category\": \"Vegetables\"}\n" +
                "]";
    }

    private List<RecognizedIngredient> parseRecognitionResponse(String response) {
        // Simple JSON parsing, Jackson is recommended for actual projects
        List<RecognizedIngredient> ingredients = new ArrayList<>();
        
        // Extract JSON array
        Pattern jsonArrayPattern = Pattern.compile("\\[(.*?)\\]", Pattern.DOTALL);
        Matcher matcher = jsonArrayPattern.matcher(response);
        
        if (matcher.find()) {
            String jsonArray = matcher.group(1);
            Pattern ingredientPattern = Pattern.compile("\\{[^}]*\\}", Pattern.DOTALL);
            Matcher ingredientMatcher = ingredientPattern.matcher(jsonArray);
            
            while (ingredientMatcher.find()) {
                String ingredientJson = ingredientMatcher.group();
                RecognizedIngredient ingredient = parseIngredientJson(ingredientJson);
                if (ingredient != null) {
                    ingredients.add(ingredient);
                }
            }
        }
        
        return ingredients;
    }

    private RecognizedIngredient parseIngredientJson(String json) {
        try {
            String name = extractValue(json, "name");
            String category = extractValue(json, "category");
            
            if (name != null) {
                return new RecognizedIngredient(name, category);
            }
        } catch (Exception e) {
            // Parse error, skip
        }
        return null;
    }

    private String extractValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public static class RecognizedIngredient {
        private String name;
        private String category;

        public RecognizedIngredient(String name, String category) {
            this.name = name;
            this.category = category;
        }

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }

}
