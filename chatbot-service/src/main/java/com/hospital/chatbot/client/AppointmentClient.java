package com.hospital.chatbot.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentClient {

    private final RestTemplate restTemplate;

    @Value("${appointment.service.url:http://localhost:8085}")
    private String appointmentServiceUrl;

    public List<Map<String, Object>> getAppointmentsByEmail(String email) {
        try {
            String url = appointmentServiceUrl + "/api/internal/patient/" + email + "/appointments";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.warn("RDV introuvables pour {}: {}", email, e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getRendezVousByPatientEmail(String email) {
        return getAppointmentsByEmail(email);
    }
}