package com.resourceservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resourceservice.dto.request.ChatRequest;
import com.resourceservice.dto.response.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("bs-user/api/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @PostMapping(produces = "application/json")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            logger.info("Received request: {}", request.getMessage());
            String userMessage = request.getMessage();
            String response = callOllama(userMessage);
            return ResponseEntity.ok(new ChatResponse(response));
        } catch (Exception e) {
            logger.error("Error calling Ollama: ", e);
            return ResponseEntity.status(500).body(new ChatResponse("Lỗi gọi Ollama: " + e.getMessage()));
        }
    }

    private String callOllama(String message) throws IOException, InterruptedException {
        String endpoint = "http://localhost:11434/api/generate";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode bodyNode = mapper.createObjectNode()
                .put("model", "gemma3:4b")
                .put("prompt", message)
                .put("stream", false);

        String body = mapper.writeValueAsString(bodyNode);
        logger.info("Request body to Ollama: {}", body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        logger.info("Ollama response status: {}", response.statusCode());
        logger.info("Ollama response body: {}", response.body());

        if (response.statusCode() != 200) {
            throw new IOException("Ollama trả về mã lỗi: " + response.statusCode());
        }

        return extractContent(response.body());
    }

    private String extractContent(String responseBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            String content = root.path("response").asText();
            if (content.isEmpty()) {
                logger.warn("Ollama response does not contain 'response' field");
                return "Không có nội dung phản hồi từ Ollama";
            }
            return content;
        } catch (Exception e) {
            logger.error("Error parsing Ollama response: ", e);
            return "Không thể phân tích phản hồi từ Ollama: " + e.getMessage();
        }
    }
}