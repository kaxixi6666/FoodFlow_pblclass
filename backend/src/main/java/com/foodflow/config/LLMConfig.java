package com.foodflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LLMConfig {

    @Value("${openai.api-key}")
    private String openAiApiKey;

    // 暂时移除OpenAiService的Bean定义，因为依赖版本可能有问题
    // 后续可以根据实际使用的OpenAI客户端库版本调整

} 
