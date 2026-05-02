package com.hospital.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservice Chatbot - Systeme de gestion hospitaliere
 *
 * Ce microservice fournit un assistant virtuel pour les patients.
 * Il utilise Google Gemini (gratuit) comme moteur de generation,
 * et communique avec les autres microservices (patient, appointment)
 * pour enrichir les reponses avec des donnees reelles (RAG).
 */
@SpringBootApplication
public class ChatbotServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatbotServiceApplication.class, args);
    }
}
