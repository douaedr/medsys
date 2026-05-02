package com.hospital.patient.controller;

import com.hospital.patient.dto.DossierMedicalDTO;
import com.hospital.patient.entity.Patient;
import com.hospital.patient.repository.PatientRepository;
import com.hospital.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Endpoints internes (service-to-service) appelés par chatbot-service.
 * Pas de JWT requis — /api/internal/** est permitAll dans SecurityConfig.
 */
@Slf4j
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalBridgeController {

    private final PatientRepository patientRepository;
    private final PatientService patientService;

    /**
     * GET /api/internal/patients/{id}
     * Récupère les infos de base d'un patient par ID.
     * Utilisé par chatbot-service → PatientClient.getPatientInfo()
     */
    @GetMapping("/patients/{id}")
    public ResponseEntity<Map<String, Object>> getPatientById(@PathVariable Long id) {
        Optional<Patient> opt = patientRepository.findById(id);
        if (opt.isEmpty()) {
            log.warn("Patient introuvable pour id {}", id);
            return ResponseEntity.notFound().build();
        }
        Patient p = opt.get();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", p.getId());
        result.put("nom", p.getNom());
        result.put("prenom", p.getPrenom());
        result.put("dateNaissance", p.getDateNaissance());
        result.put("sexe", p.getSexe() != null ? p.getSexe().name() : null);
        result.put("groupeSanguin", p.getGroupeSanguin() != null ? p.getGroupeSanguin().name() : null);
        result.put("telephone", p.getTelephone());
        result.put("email", p.getEmail());
        result.put("adresse", p.getAdresse());
        result.put("ville", p.getVille());
        result.put("mutuelle", p.getMutuelle());
        result.put("numeroCNSS", p.getNumeroCNSS());
        result.put("cin", p.getCin());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/internal/patients/by-email/{email}
     * Récupère les infos de base d'un patient par email.
     * Utilisé par chatbot-service → PatientClient.getPatientByEmail()
     */
    @GetMapping("/patients/by-email/{email}")
    public ResponseEntity<Map<String, Object>> getPatientByEmail(@PathVariable String email) {
        Optional<Patient> opt = patientRepository.findByEmail(email);
        if (opt.isEmpty()) {
            log.warn("Patient introuvable pour email {}", email);
            return ResponseEntity.notFound().build();
        }
        Patient p = opt.get();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", p.getId());
        result.put("nom", p.getNom());
        result.put("prenom", p.getPrenom());
        result.put("dateNaissance", p.getDateNaissance());
        result.put("sexe", p.getSexe() != null ? p.getSexe().name() : null);
        result.put("groupeSanguin", p.getGroupeSanguin() != null ? p.getGroupeSanguin().name() : null);
        result.put("telephone", p.getTelephone());
        result.put("email", p.getEmail());
        result.put("adresse", p.getAdresse());
        result.put("ville", p.getVille());
        result.put("mutuelle", p.getMutuelle());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/internal/patients/{id}/dossier
     * Récupère le dossier médical complet d'un patient.
     * Utilisé par chatbot-service → PatientClient.getDossierMedical()
     */
    @GetMapping("/patients/{id}/dossier")
    public ResponseEntity<DossierMedicalDTO> getDossierMedical(@PathVariable Long id) {
        try {
            DossierMedicalDTO dossier = patientService.getDossierMedical(id);
            return ResponseEntity.ok(dossier);
        } catch (Exception e) {
            log.warn("Dossier introuvable pour patient {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
