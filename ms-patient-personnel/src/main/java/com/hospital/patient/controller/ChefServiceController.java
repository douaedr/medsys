package com.hospital.patient.controller;

import com.hospital.patient.dto.*;
import com.hospital.patient.entity.Service;
import com.hospital.patient.security.JwtService;
import com.hospital.patient.service.ChefServiceManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * FEAT 1 — Endpoints du chef de service.
 * Tous les endpoints exigent le rôle CHEF_SERVICE (configuré dans SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/chef")
@RequiredArgsConstructor
public class ChefServiceController {

    private final ChefServiceManager manager;
    private final JwtService jwtService;

    /* ────── Service ────── */

    @GetMapping("/service")
    public ResponseEntity<Service> getMonService(HttpServletRequest req) {
        Long chefId = chefId(req);
        return ResponseEntity.ok(manager.getServiceForChef(chefId));
    }

    /* ────── Médecins du service ────── */

    @GetMapping("/medecins")
    public ResponseEntity<List<MedecinSummaryDTO>> getMedecins(HttpServletRequest req) {
        return ResponseEntity.ok(manager.getMedecinsDuService(chefId(req)));
    }

    /* ────── Statistiques ────── */

    @GetMapping("/stats")
    public ResponseEntity<ChefServiceStatsDTO> getStats(HttpServletRequest req) {
        return ResponseEntity.ok(manager.getStats(chefId(req)));
    }

    /* ────── Créneaux ────── */

    @GetMapping("/creneaux")
    public ResponseEntity<List<CreneauMedecinDTO>> getCreneaux(HttpServletRequest req) {
        return ResponseEntity.ok(manager.getCreneauxDuService(chefId(req)));
    }

    @PostMapping("/creneaux")
    public ResponseEntity<CreneauMedecinDTO> creerCreneau(HttpServletRequest req,
                                                          @RequestBody CreneauMedecinRequest body) {
        return ResponseEntity.ok(manager.creerCreneau(chefId(req), body));
    }

    @DeleteMapping("/creneaux/{id}")
    public ResponseEntity<Map<String, Object>> supprimerCreneau(HttpServletRequest req,
                                                                @PathVariable Long id) {
        manager.supprimerCreneau(chefId(req), id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("id", id);
        return ResponseEntity.ok(resp);
    }

    /* ────── FEAT 6 — Planning ────── */

    @GetMapping("/planning/service")
    public ResponseEntity<List<CreneauMedecinDTO>> getPlanningService(HttpServletRequest req) {
        return ResponseEntity.ok(manager.getCreneauxDuService(chefId(req)));
    }

    @GetMapping("/planning")
    public ResponseEntity<List<CreneauMedecinDTO>> getPlanningMedecin(@RequestParam Long medecinId) {
        return ResponseEntity.ok(manager.getCreneauxMedecin(medecinId));
    }

    /* ────── Helpers ────── */

    private Long chefId(HttpServletRequest req) {
        String token = extractToken(req);
        Long personnelId = jwtService.extractPersonnelId(token);
        if (personnelId == null) {
            throw new IllegalStateException("Token sans personnelId — assurez-vous que le compte chef a un personnelId.");
        }
        return personnelId;
    }

    private String extractToken(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) {
            throw new IllegalStateException("Authorization header manquant");
        }
        return h.substring(7);
    }
}
