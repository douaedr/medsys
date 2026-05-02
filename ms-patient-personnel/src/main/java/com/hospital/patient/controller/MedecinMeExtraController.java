package com.hospital.patient.controller;

import com.hospital.patient.dto.CreneauMedecinDTO;
import com.hospital.patient.dto.MessagePersonnelDTO;
import com.hospital.patient.entity.MessagePersonnel;
import com.hospital.patient.repository.MessagePersonnelRepository;
import com.hospital.patient.security.JwtService;
import com.hospital.patient.service.ChefServiceManager;
import com.hospital.patient.service.MessagePersonnelService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FEAT 3 + 6 + 7 — Endpoints liés au médecin connecté que le portail
 * actuel (MedecinPortalController) ne couvre pas.
 *
 * - FEAT 3 : déjà géré par BlockedSlotRepository côté secrétaire ; on l'expose côté médecin
 *   en s'appuyant sur les endpoints existants côté secrétaire (le frontend appelle directement).
 *   Ici on expose juste son propre planning.
 * - FEAT 6 : /api/v1/medecin/me/planning
 * - FEAT 7 : /api/v1/medecin/me/taches  (alias des messages urgents)
 *
 * NB : pour FEAT 3 (créneaux bloqués daté), le SecretaireController existe déjà.
 *      Le frontend "Mon planning" du médecin utilise les mêmes endpoints (à élargir
 *      côté Spring Security : /api/v1/secretaire/slots/** doit accepter MEDECIN — déjà OK
 *      car SecurityConfig autorise SECRETARY, MEDECIN, ADMIN sur /api/v1/secretaire/**).
 */
@RestController
@RequestMapping("/api/v1/medecin/me")
@RequiredArgsConstructor
public class MedecinMeExtraController {

    private final ChefServiceManager chefManager;
    private final MessagePersonnelService messageService;
    private final MessagePersonnelRepository messageRepo;
    private final JwtService jwtService;

    /* ────── FEAT 6 — Planning hebdomadaire du médecin ────── */

    @GetMapping("/planning")
    public ResponseEntity<List<CreneauMedecinDTO>> monPlanning(HttpServletRequest req) {
        Long medecinId = jwtService.extractPersonnelId(token(req));
        return ResponseEntity.ok(chefManager.getCreneauxMedecin(medecinId));
    }

    /* ────── FEAT 7 — Tâches (= messages urgents reçus non lus) ────── */

    @GetMapping("/taches")
    public ResponseEntity<List<MessagePersonnelDTO>> mesTaches(HttpServletRequest req) {
        Long uid = jwtService.extractUserId(token(req));
        // Messages urgents non lus = "tâches"
        List<MessagePersonnel> list = messageRepo
                .findByDestinataireIdAndPrioriteAndLuFalseOrderByDateEnvoiDesc(uid, MessagePersonnel.Priorite.URGENTE);
        return ResponseEntity.ok(list.stream().map(this::toDto).toList());
    }

    /* ────── Helpers ────── */

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
