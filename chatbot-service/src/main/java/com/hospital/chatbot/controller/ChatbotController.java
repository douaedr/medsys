package com.hospital.chatbot.controller;

import com.hospital.chatbot.dto.ChatRequest;
import com.hospital.chatbot.dto.ChatResponse;
import com.hospital.chatbot.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controleur REST exposant l'API du chatbot.
 *
 * Endpoints :
 *   POST /api/v1/chatbot/ask     - Poser une question
 *   GET  /api/v1/chatbot/health  - Verifier que le service tourne
 *
 * 🔧 FIX: Préfixe changé de /api/chatbot → /api/v1/chatbot pour cohérence
 *         avec les autres microservices (ms-auth, ms-patient-personnel) et
 *         le proxy Vite du frontend qui route /api/v1/chatbot vers ce service.
 */
@RestController
@RequestMapping("/api/v1/chatbot")
@CrossOrigin(origins = "*") // Permet aux frontends d'appeler depuis d'autres ports
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * Endpoint principal : recoit une question et renvoie une reponse generee.
     *
     * Exemple de body :
     * {
     *   "patientId": 1,
     *   "question": "Quand est mon prochain rendez-vous ?"
     * }
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> ask(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatbotService.askQuestion(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de healthcheck : utile pour verifier rapidement
     * que le service est demarre.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chatbot service is running OK");
    }
}
