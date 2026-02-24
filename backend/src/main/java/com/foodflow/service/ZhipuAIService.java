package com.foodflow.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import okhttp3.*;
import org.apache.commons.codec.binary.Base64;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ZhipuAIService {

    private static final String API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    private static final String API_KEY = "5f41881a249d43ada948ef287b72f0c9.HQNZjfXnADSoFFDX"; // Replace with actual API Key
    private static final String MODEL = "glm-4v";
    private static final int TIMEOUT_SECONDS = 30;
    private static final double TEMPERATURE = 0.1;
    private static final int MAX_TOKENS = 2000;

    private final OkHttpClient client;

    public ZhipuAIService() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .build();
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
        // Convert image to Base64
        String base64Image = Base64.encodeBase64String(imageData);
        String imageUrl = "data:image/" + imageFormat + ";base64," + base64Image;

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
            instruction = "请识别这张冰箱照片中的所有食材名称，忽略包装/背景，仅返回JSON数组：[\"食材1\",\"食材2\"]，无多余解释。";
        } else {
            // Default to receipt scenario
            instruction = "请识别这张收据图片中的所有文字，提取食材名称、数量、购买日期信息，仅返回结构化JSON数组：[{\"name\":\"食材名\",\"quantity\":\"数量\"}]，无多余解释。";
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

        // Send request
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            // Parse response
            String responseBody = response.body().string();
            JSONObject jsonResponse = JSON.parseObject(responseBody);

            // Extract translation result
            if (jsonResponse.containsKey("choices")) {
                List<JSONObject> choices = jsonResponse.getJSONArray("choices").toJavaList(JSONObject.class);
                if (!choices.isEmpty()) {
                    JSONObject choice = choices.get(0);
                    JSONObject message = choice.getJSONObject("message");
                    if (message != null && message.containsKey("content")) {
                        return message.getString("content");
                    }
                }
            }

            throw new IOException("Failed to extract translation result from response: " + responseBody);
        }
    }

    /**
     * Read image data from input stream
     * @param inputStream Input stream
     * @return Image byte array
     * @throws IOException
     */
    public byte[] readImageFromInputStream(InputStream inputStream) throws IOException {
        return inputStream.readAllBytes();
    }

    /**
     * Get image format
     * @param fileName File name
     * @return Image format
     */
    public String getImageFormat(String fileName) {
        if (fileName == null) {
            return "jpg";
        }
        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
            return "jpeg";
        } else if (lowerFileName.endsWith(".png")) {
            return "png";
        } else if (lowerFileName.endsWith(".webp")) {
            return "webp";
        } else {
            return "jpg";
        }
    }
}
