package com.hospital.patient.controller;

import com.hospital.patient.dto.MessagePersonnelDTO;
import com.hospital.patient.entity.MessagePersonnel;
import com.hospital.patient.repository.MessagePersonnelRepository;
import com.hospital.patient.repository.PatientRepository;
import com.hospital.patient.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * FEAT 7 — Endpoints pour le rôle PERSONNEL (infirmier, brancardier, aide-soignant).
 * Toutes les tâches sont en réalité des messages urgents reçus.
 */
@RestController
@RequestMapping("/api/v1/personnel/me")
@RequiredArgsConstructor
public class PersonnelPortalController {

    private final MessagePersonnelRepository messageRepo;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;

    @GetMapping("/taches")
    public ResponseEntity<List<MessagePersonnelDTO>> taches(HttpServletRequest req) {
        Long uid = jwtService.extractUserId(token(req));
        List<MessagePersonnel> tasks = messageRepo
                .findByDestinataireIdAndPrioriteAndLuFalseOrderByDateEnvoiDesc(uid, MessagePersonnel.Priorite.URGENTE);
        return ResponseEntity.ok(tasks.stream().map(this::toDto).toList());
    }

    /**
     * Renvoie un échantillon de patients (plus tard : à filtrer par service).
     * Pour l'instant, on retourne les 50 premiers patients.
     */
    @GetMapping("/patients-jour")
    public ResponseEntity<Map<String, Object>> patientsJour() {
        Map<String, Object> resp = new HashMap<>();
        long total = patientRepository.count();
        resp.put("total", total);
        resp.put("patients", patientRepository.findAll().stream().limit(50).toList());
        return ResponseEntity.ok(resp);
    }

    private String token(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) {
            throw new IllegalStateException("Authorization header manquant");
        }
        return h.substring(7);
    }

    private MessagePersonnelDTO toDto(MessagePersonnel m) {
        return MessagePersonnelDTO.builder()
                .id(m.getId())
                .expediteurId(m.getExpediteurId())
                .expediteurNom(m.getExpediteurNom())
                .expediteurRole(m.getExpediteurRole())
                .destinataireId(m.getDestinataireId())
                .destinataireNom(m.getDestinataireNom())
                .destinataireRole(m.getDestinataireRole())
                .contenu(m.getContenu())
                .lu(m.getLu())
                .dateEnvoi(m.getDateEnvoi())
                .dateLecture(m.getDateLecture())
                .priorite(m.getPriorite())
                .build();
    }
}
