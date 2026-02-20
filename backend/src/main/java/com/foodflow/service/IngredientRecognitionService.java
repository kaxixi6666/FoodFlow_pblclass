package com.foodflow.service;

import com.theokanning.openai.completion.CompletionRequest;
import com.theokanning.openai.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IngredientRecognitionService {

    private final OpenAiService openAiService;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.temperature}")
    private double temperature;

    public IngredientRecognitionService(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    public List<RecognizedIngredient> recognizeIngredientsFromText(String text) {
        String prompt = createRecognitionPrompt(text);
        CompletionRequest request = CompletionRequest.builder()
                .model(model)
                .prompt(prompt)
                .temperature(temperature)
                .maxTokens(1000)
                .build();

        String response = openAiService.createCompletion(request).getChoices().get(0).getText();
        return parseRecognitionResponse(response);
    }

    public List<RecognizedIngredient> recognizeIngredientsFromImageDescription(String imageDescription) {
        String prompt = createImageRecognitionPrompt(imageDescription);
        CompletionRequest request = CompletionRequest.builder()
                .model(model)
                .prompt(prompt)
                .temperature(temperature)
                .maxTokens(1000)
                .build();

        String response = openAiService.createCompletion(request).getChoices().get(0).getText();
        return parseRecognitionResponse(response);
    }

    private String createRecognitionPrompt(String text) {
        return "Analyze the following text and identify all food ingredients mentioned. " +
                "For each ingredient, provide: name, category, quantity (if mentioned), and unit (if mentioned). " +
                "Format the output as JSON with an array of objects, each containing: name, category, quantity, unit.\n\n" +
                "Text: " + text + "\n\n" +
                "Example output:\n" +
                "[\n" +
                "  {\"name\": \"Tomatoes\", \"category\": \"Vegetables\", \"quantity\": \"2\", \"unit\": \"pieces\"},\n" +
                "  {\"name\": \"Cheddar Cheese\", \"category\": \"Dairy\", \"quantity\": \"100\", \"unit\": \"grams\"}\n" +
                "]";
    }

    private String createImageRecognitionPrompt(String imageDescription) {
        return "Based on the following image description, identify all food ingredients that might be present. " +
                "For each ingredient, provide: name, category, estimated quantity, and unit. " +
                "Format the output as JSON with an array of objects, each containing: name, category, quantity, unit.\n\n" +
                "Image description: " + imageDescription + "\n\n" +
                "Example output:\n" +
                "[\n" +
                "  {\"name\": \"Tomatoes\", \"category\": \"Vegetables\", \"quantity\": \"3\", \"unit\": \"pieces\"},\n" +
                "  {\"name\": \"Lettuce\", \"category\": \"Vegetables\", \"quantity\": \"1\", \"unit\": \"head\"}\n" +
                "]";
    }

    private List<RecognizedIngredient> parseRecognitionResponse(String response) {
        // 简单的JSON解析，实际项目中建议使用Jackson
        List<RecognizedIngredient> ingredients = new ArrayList<>();
        
        // 提取JSON数组
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
            String quantity = extractValue(json, "quantity");
            String unit = extractValue(json, "unit");
            
            if (name != null) {
                return new RecognizedIngredient(name, category, quantity, unit);
            }
        } catch (Exception e) {
            // 解析错误，跳过
        }
        return null;
    }

    private String extractValue(String json, String key) {
        Pattern pattern = Pattern.compile("\\"" + key + "\\"\\s*:\\s*\\"([^\\"]*)\\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public static class RecognizedIngredient {
        private String name;
        private String category;
        private String quantity;
        private String unit;

        public RecognizedIngredient(String name, String category, String quantity, String unit) {
            this.name = name;
            this.category = category;
            this.quantity = quantity;
            this.unit = unit;
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

        public String getQuantity() {
            return quantity;
        }

        public void setQuantity(String quantity) {
            this.quantity = quantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }
    }

}
