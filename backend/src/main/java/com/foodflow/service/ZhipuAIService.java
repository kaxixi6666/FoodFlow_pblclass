package com.foodflow.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import okhttp3.*;
import org.apache.commons.codec.binary.Base64;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ZhipuAIService {
    
    private final OkHttpClient client;
    
    private static final String API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    private static final String API_KEY = "5f41881a249d43ada948ef287b72f0c9.HQNZjfXnADSoFFDX";
    private static final String MODEL = "glm-4v";
    private static final double TEMPERATURE = 0.7;
    private static final int MAX_TOKENS = 2048;
    
    public ZhipuAIService() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
                .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .retryOnConnectionFailure(true)
                .build();
    }
    
    /**
     * Get image format from filename
     * @param filename Image filename
     * @return Image format (jpg, png, webp)
     */
    public String getImageFormat(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "jpg";
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "jpg";
        } else if (lowerFilename.endsWith(".png")) {
            return "png";
        } else if (lowerFilename.endsWith(".webp")) {
            return "webp";
        } else {
            return "jpg";
        }
    }
    
    /**
     * Detect text from image and translate to English
     * @param imageData Image byte array
     * @param imageFormat Image format (jpg, png, webp)
     * @param scenario Analysis scenario (receipt or fridge)
     * @return Translated English result
     * @throws IOException
     */
    public String detectAndTranslateImage(byte[] imageData, String imageFormat, String scenario) throws IOException {
        System.out.println("ZhipuAIService.detectAndTranslateImage - Starting analysis");
        System.out.println("ZhipuAIService.detectAndTranslateImage - Scenario: " + scenario);
        System.out.println("ZhipuAIService.detectAndTranslateImage - Image size: " + imageData.length + " bytes");
        
        // Convert image to Base64
        String base64Image = Base64.encodeBase64String(imageData);
        String imageUrl = "data:image/" + imageFormat + ";base64," + base64Image;
        System.out.println("ZhipuAIService.detectAndTranslateImage - Image converted to base64");

        // Build request body
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", MODEL);
        requestBody.put("temperature", TEMPERATURE);
        requestBody.put("max_tokens", MAX_TOKENS);

        List<JSONObject> messages = new ArrayList<>();

        // System message
        JSONObject systemMessage = new JSONObject();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a professional image text recognition and translation assistant");
        messages.add(systemMessage);

        // User message - contains image and translation instruction
        JSONObject userMessage = new JSONObject();
        userMessage.put("role", "user");

        List<Object> userContent = new ArrayList<>();

        // Image content
        JSONObject imageContent = new JSONObject();
        imageContent.put("type", "image_url");
        JSONObject imageUrlObject = new JSONObject();
        imageUrlObject.put("url", imageUrl);
        imageContent.put("image_url", imageUrlObject);
        userContent.add(imageContent);

        // Translation instruction based on scenario
        JSONObject textContent = new JSONObject();
        textContent.put("type", "text");
        
        String instruction;
        if ("fridge".equalsIgnoreCase(scenario)) {
            instruction = "Please identify all food ingredients visible in this fridge image, ignore packaging and background.\nRules:\nReturn ONLY pure JSON array, no markdown, no ```json, no backticks, no extra words.\nFormat: [\"ingredient1\",\"ingredient2\",\"ingredient3\"]\nDo NOT add any explanation outside of JSON.";
        } else {
            // Default to receipt scenario
            instruction = "Please identify all food ingredients in this receipt image.\nRules:\n1. Translate all ingredient names to English\n2. Return ONLY pure JSON array, no markdown, no ```json, no backticks, no extra words\n3. Format: [\"ingredient1\",\"ingredient2\",\"ingredient3\"]\n4. Do NOT add any explanation outside of JSON\n5. All ingredient names must be in English\n6. Do NOT include quantities, only ingredient names";
        }
        
        textContent.put("text", instruction);
        userContent.add(textContent);

        userMessage.put("content", userContent);
        messages.add(userMessage);

        requestBody.put("messages", messages);

        // Build request
        RequestBody body = RequestBody.create(
                requestBody.toJSONString(),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(API_URL)
                .addHeader("Authorization", "Bearer " + API_KEY)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        System.out.println("ZhipuAIService.detectAndTranslateImage - Sending request to BigModel API");
        
        // Send request
        try (Response response = client.newCall(request).execute()) {
            System.out.println("ZhipuAIService.detectAndTranslateImage - Response received: " + response.code());
            
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error body";
                System.err.println("ZhipuAIService.detectAndTranslateImage - API Error: " + response.code() + " - " + errorBody);
                throw new IOException("Unexpected code " + response + " - " + errorBody);
            }

            // Parse response
            String responseBody = response.body().string();
            System.out.println("ZhipuAIService.detectAndTranslateImage - Response body length: " + responseBody.length());
            
            JSONObject jsonResponse = JSON.parseObject(responseBody);

            // Extract translation result
            if (jsonResponse.containsKey("choices")) {
                List<JSONObject> choices = jsonResponse.getJSONArray("choices").toJavaList(JSONObject.class);
                if (!choices.isEmpty()) {
                    JSONObject choice = choices.get(0);
                    JSONObject message = choice.getJSONObject("message");
                    if (message != null && message.containsKey("content")) {
                        String result = message.getString("content");
                        System.out.println("ZhipuAIService.detectAndTranslateImage - Analysis completed successfully");
                        return result;
                    }
                }
            }

            throw new IOException("Failed to extract translation result from response: " + responseBody);
        } catch (IOException e) {
            System.err.println("ZhipuAIService.detectAndTranslateImage - IOException: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
