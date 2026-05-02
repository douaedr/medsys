package com.hospital.patient.controller;

import com.hospital.patient.entity.*;
import com.hospital.patient.repository.*;
import com.hospital.patient.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/medecin/me")
@RequiredArgsConstructor
public class MedecinPortalController {

    private final MedecinRepository medecinRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;

    private Medecin getMedecinFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long personnelId = jwtService.extractPersonnelId(token);
        if (personnelId != null) {
            return medecinRepository.findById(personnelId)
                    .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec personnelId=" + personnelId));
        }
        Long userId = jwtService.extractUserId(token);
        if (userId != null) {
            return medecinRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec userId=" + userId));
        }
        throw new RuntimeException("Impossible d'identifier le médecin depuis le token");
    }

    @GetMapping("/consultations")
    public ResponseEntity<?> getMyConsultations(HttpServletRequest request) {
        Medecin medecin = getMedecinFromToken(request);
        List<Consultation> consultations = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecin.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Consultation c : consultations) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("dateConsultation", c.getDateConsultation());
            map.put("motif", c.getMotif());
            map.put("diagnostic", c.getDiagnostic());
            map.put("observations", c.getObservations());
            map.put("traitement", c.getTraitement());
            map.put("poids", c.getPoids());
            map.put("taille", c.getTaille());
            map.put("tensionSystolique", c.getTensionSystolique());
            map.put("tensionDiastolique", c.getTensionDiastolique());
            map.put("temperature", c.getTemperature());

            // Récupérer le nom du patient via patientId
            if (c.getPatientId() != null) {
                map.put("patientId", c.getPatientId());
                patientRepository.findById(c.getPatientId()).ifPresent(p ->
                    map.put("patientNom", p.getPrenom() + " " + p.getNom())
                );
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/consultations")
    public ResponseEntity<?> createConsultation(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Medecin medecin = getMedecinFromToken(request);

        Long patientId = Long.valueOf(body.get("patientId").toString());
        patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Consultation consultation = new Consultation();
        consultation.setDateConsultation(LocalDateTime.now());
        consultation.setMotif((String) body.get("motif"));
        consultation.setDiagnostic((String) body.get("diagnostic"));
        consultation.setObservations((String) body.get("observations"));
        consultation.setTraitement((String) body.get("traitement"));
        consultation.setMedecin(medecin);
        consultation.setPatientId(patientId);

        if (body.get("poids") != null) consultation.setPoids(Double.valueOf(body.get("poids").toString()));
        if (body.get("taille") != null) consultation.setTaille(Double.valueOf(body.get("taille").toString()));
        if (body.get("tensionSystolique") != null) consultation.setTensionSystolique(Integer.valueOf(body.get("tensionSystolique").toString()));
        if (body.get("tensionDiastolique") != null) consultation.setTensionDiastolique(Integer.valueOf(body.get("tensionDiastolique").toString()));
        if (body.get("temperature") != null) consultation.setTemperature(Double.valueOf(body.get("temperature").toString()));

        consultationRepository.save(consultation);

        return ResponseEntity.ok(Map.of("message", "Consultation créée avec succès", "id", consultation.getId()));
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getMyPatients(HttpServletRequest request) {
        Medecin medecin = getMedecinFromToken(request);
        List<Consultation> consultations = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecin.getId());

        Set<Long> seenIds = new HashSet<>();
        List<Map<String, Object>> patients = new ArrayList<>();
        for (Consultation c : consultations) {
            if (c.getPatientId() != null && seenIds.add(c.getPatientId())) {
                patientRepository.findById(c.getPatientId()).ifPresent(p ->
                    patients.add(Map.of(
                        "id", p.getId(),
                        "nom", p.getNom(),
                        "prenom", p.getPrenom(),
                        "email", p.getEmail() != null ? p.getEmail() : "",
                        "telephone", p.getTelephone() != null ? p.getTelephone() : ""
                    ))
                );
            }
        }
        return ResponseEntity.ok(patients);
    }
}