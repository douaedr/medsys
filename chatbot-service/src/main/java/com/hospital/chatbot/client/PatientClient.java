package com.hospital.chatbot.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientClient {

    private final RestTemplate restTemplate;

    @Value("${patient.service.url:http://localhost:8081}")
    private String patientServiceUrl;

    public Map<String, Object> getPatientByEmail(String email) {
        try {
            String url = patientServiceUrl + "/api/internal/patients/by-email/" + email;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (Exception e) {
            log.warn("Patient introuvable pour {}: {}", email, e.getMessage());
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> getPatientInfo(Long patientId) {
        try {
            String url = patientServiceUrl + "/api/internal/patients/" + patientId;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (Exception e) {
            log.warn("Patient introuvable pour id {}: {}", patientId, e.getMessage());
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> getDossierMedical(Long patientId) {
        try {
            String url = patientServiceUrl + "/api/internal/patients/" + patientId + "/dossier";
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (Exception e) {
            log.warn("Dossier introuvable pour patient {}: {}", patientId, e.getMessage());
            return Collections.emptyMap();
        }
    }
}