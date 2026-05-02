package com.hospital.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * Structure JSON renvoyee par l'API Gemini.
 *
 * Format recu :
 * {
 *   "candidates": [
 *     {
 *       "content": {
 *         "parts": [
 *           { "text": "Reponse generee..." }
 *         ]
 *       }
 *     }
 *   ]
 * }
 *
 * @JsonIgnoreProperties pour ignorer les champs supplementaires
 * que Gemini peut renvoyer (safetyRatings, finishReason, etc.)
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiResponse {

    private List<Candidate> candidates;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        private Content content;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Part {
        private String text;
    }
}
