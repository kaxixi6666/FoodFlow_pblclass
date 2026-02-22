package com.foodflow.controller;

import com.foodflow.service.IngredientRecognitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/ingredients/recognition")
public class IngredientRecognitionController {

    private final IngredientRecognitionService recognitionService;

    public IngredientRecognitionController(IngredientRecognitionService recognitionService) {
        this.recognitionService = recognitionService;
    }

    @PostMapping("/text")
    public ResponseEntity<List<IngredientRecognitionService.RecognizedIngredient>> recognizeFromText(
            @RequestBody RecognitionRequest request) {
        List<IngredientRecognitionService.RecognizedIngredient> ingredients = 
                recognitionService.recognizeIngredientsFromText(request.getText());
        return ResponseEntity.ok(ingredients);
    }

    @PostMapping("/image-description")
    public ResponseEntity<List<IngredientRecognitionService.RecognizedIngredient>> recognizeFromImageDescription(
            @RequestBody RecognitionRequest request) {
        List<IngredientRecognitionService.RecognizedIngredient> ingredients = 
                recognitionService.recognizeIngredientsFromImageDescription(request.getDescription());
        return ResponseEntity.ok(ingredients);
    }

    @PostMapping("/image")
    public ResponseEntity<List<IngredientRecognitionService.RecognizedIngredient>> recognizeFromImage(
            @RequestParam("image") MultipartFile image) {
        // 这里可以集成图像识别服务，获取图像描述
        // 然后调用大语言模型进行食材识别
        // 暂时返回空列表，实际项目中需要实现完整逻辑
        return ResponseEntity.ok(List.of());
    }

    public static class RecognitionRequest {
        private String text;
        private String description;

        // Getters and setters
        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

}
