package com.hospital.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Structure JSON attendue par l'API Gemini.
 *
 * Format envoye :
 * {
 *   "contents": [
 *     {
 *       "parts": [
 *         { "text": "..." }
 *       ]
 *     }
 *   ]
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequest {

    private List<Content> contents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Part {
        private String text;
    }
}
