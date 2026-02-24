package com.foodflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LLMConfig {

    @Value("${openai.api-key}")
    private String openAiApiKey;

    // Temporarily remove OpenAiService Bean definition as dependency version may have issues
    // Can adjust later based on actual OpenAI client library version used

} 
