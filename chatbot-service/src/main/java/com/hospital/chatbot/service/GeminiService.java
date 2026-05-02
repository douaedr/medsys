package com.hospital.chatbot.service;

import com.hospital.chatbot.dto.GeminiRequest;
import com.hospital.chatbot.dto.GeminiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Service responsable de l'appel a l'API Google Gemini.
 *
 * 🔧 V3 : amélioration de la gestion d'erreur
 *  - retry automatique 1 fois en cas de timeout reseau
 *  - distinction entre quota epuise (429), erreur serveur (5xx), timeout
 *  - messages d'erreur plus clairs pour l'utilisateur
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final int MAX_RETRY = 1;

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiUrl;

    public GeminiService(RestTemplate restTemplate,
                         @Value("${gemini.api.key}") String apiKey,
                         @Value("${gemini.api.url}") String apiUrl) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    public String generateResponse(String prompt) {
        if (apiKey == null || apiKey.isBlank() || "TA_CLE_API_ICI".equals(apiKey)) {
            log.error("La cle API Gemini n'est pas configuree !");
            return "Erreur de configuration : la cle API Gemini n'est pas definie. " +
                   "Verifiez le fichier application.properties.";
        }

        // 🔧 V3 : retry simple en cas d'echec reseau
        Exception lastError = null;
        for (int attempt = 0; attempt <= MAX_RETRY; attempt++) {
            try {
                return doGenerate(prompt);
            } catch (HttpClientErrorException.TooManyRequests e) {
                // 429 : quota epuise, ne pas retry
                log.warn("Quota Gemini epuise (429)");
                return "Le quota gratuit de l'assistant est épuisé pour aujourd'hui. " +
                       "Réessayez demain ou contactez le secrétariat de l'hôpital.";
            } catch (HttpClientErrorException e) {
                // Autres erreurs 4xx : ne pas retry
                log.error("Erreur client Gemini : {} - {}", e.getStatusCode(), e.getMessage());
                return "Désolé, je ne peux pas traiter cette question. Reformulez ou demandez " +
                       "directement à votre médecin.";
            } catch (HttpServerErrorException | ResourceAccessException e) {
                // 5xx ou timeout : retry
                lastError = e;
                log.warn("Erreur serveur/reseau Gemini (tentative {}/{}): {}",
                        attempt + 1, MAX_RETRY + 1, e.getMessage());
                if (attempt < MAX_RETRY) {
                    try { Thread.sleep(1000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                }
            } catch (Exception e) {
                // Autres erreurs inattendues
                log.error("Erreur inattendue Gemini : {}", e.getMessage(), e);
                return "Une erreur inattendue est survenue. Réessayez dans quelques instants.";
            }
        }

        // Tous les essais ont échoué
        log.error("Echec de l'appel Gemini apres {} tentatives", MAX_RETRY + 1);
        return "L'assistant est temporairement indisponible (problème réseau). " +
               "Réessayez dans quelques minutes.";
    }

    /**
     * Appel effectif à l'API Gemini.
     */
    private String doGenerate(String prompt) {
        GeminiRequest.Part part = new GeminiRequest.Part(prompt);
        GeminiRequest.Content content = new GeminiRequest.Content(List.of(part));
        GeminiRequest request = new GeminiRequest(List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        String urlWithKey = apiUrl + "?key=" + apiKey;

        log.info("Appel a Gemini API...");
        GeminiResponse response = restTemplate.postForObject(urlWithKey, entity, GeminiResponse.class);

        if (response != null
                && response.getCandidates() != null
                && !response.getCandidates().isEmpty()
                && response.getCandidates().get(0).getContent() != null
                && response.getCandidates().get(0).getContent().getParts() != null
                && !response.getCandidates().get(0).getContent().getParts().isEmpty()) {

            String text = response.getCandidates().get(0)
                    .getContent()
                    .getParts()
                    .get(0)
                    .getText();
            log.info("Reponse Gemini recue ({} caracteres)", text.length());
            return text;
        }

        log.warn("Reponse Gemini vide ou malformee");
        return "Désolé, je n'ai pas pu générer de réponse pour le moment. Pouvez-vous reformuler votre question ?";
    }
}
