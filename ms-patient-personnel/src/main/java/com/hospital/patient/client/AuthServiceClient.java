package com.hospital.patient.client;

import com.hospital.patient.dto.CollegueDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Client pour interroger ms-auth via les endpoints /api/internal/** (permitAll, pas de JWT).
 * NB : ces endpoints DOIVENT exister côté ms-auth. Voir AuthInternalController.java fourni dans ce zip.
 */
@Component
@Slf4j
public class AuthServiceClient {

    @Value("${ms-auth.url:http://localhost:8082}")
    private String msAuthUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Récupère tous les comptes utilisateurs (pour la liste des collègues).
     */
    @SuppressWarnings("unchecked")
    public List<CollegueDTO> getAllUsers() {
        try {
            String url = msAuthUrl + "/api/internal/users";
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Collections.emptyList();
            }
            List<Map<String, Object>> body = response.getBody();
            List<CollegueDTO> result = new ArrayList<>();
            for (Map<String, Object> u : body) {
                result.add(toDto(u));
            }
            return result;
        } catch (Exception e) {
            log.warn("Impossible de joindre ms-auth /api/internal/users : {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Récupère uniquement les comptes du personnel (non patients).
     */
    public List<CollegueDTO> getAllPersonnel() {
        return getAllUsers().stream()
                .filter(u -> u.getRole() != null && !"PATIENT".equalsIgnoreCase(u.getRole()))
                .toList();
    }

    /**
     * Filtre par rôle (ex: SECRETARY, PERSONNEL, MEDECIN, DIRECTEUR).
     */
    public List<CollegueDTO> getByRole(String role) {
        return getAllUsers().stream()
                .filter(u -> role.equalsIgnoreCase(u.getRole()))
                .toList();
    }

    /**
     * Récupère un utilisateur par son personnelId (medecins_ref.id).
     */
    @SuppressWarnings("unchecked")
    public CollegueDTO getByPersonnelId(Long personnelId) {
        try {
            String url = msAuthUrl + "/api/internal/users/personnel/" + personnelId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return null;
            }
            return toDto(response.getBody());
        } catch (Exception e) {
            log.debug("Pas d'utilisateur trouvé pour personnelId={} : {}", personnelId, e.getMessage());
            return null;
        }
    }

    private CollegueDTO toDto(Map<String, Object> u) {
        return CollegueDTO.builder()
                .userId(asLong(u.get("id")))
                .email((String) u.get("email"))
                .nom((String) u.get("nom"))
                .prenom((String) u.get("prenom"))
                .role((String) u.get("role"))
                .personnelId(asLong(u.get("personnelId")))
                .build();
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }
}
