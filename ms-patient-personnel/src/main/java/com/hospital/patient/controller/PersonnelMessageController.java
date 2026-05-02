package com.hospital.patient.controller;

import com.hospital.patient.dto.*;
import com.hospital.patient.security.JwtService;
import com.hospital.patient.service.MessagePersonnelService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * FEAT 2 — Messagerie inter-personnel.
 * Endpoints sous /api/v1/personnel/messages/** (authenticated, tous rôles personnel).
 */
@RestController
@RequestMapping("/api/v1/personnel")
@RequiredArgsConstructor
public class PersonnelMessageController {

    private final MessagePersonnelService service;
    private final JwtService jwtService;

    @GetMapping("/messages/recus")
    public ResponseEntity<List<MessagePersonnelDTO>> recus(HttpServletRequest req) {
        return ResponseEntity.ok(service.getMessagesRecus(currentUserId(req)));
    }

    @GetMapping("/messages/envoyes")
    public ResponseEntity<List<MessagePersonnelDTO>> envoyes(HttpServletRequest req) {
        return ResponseEntity.ok(service.getMessagesEnvoyes(currentUserId(req)));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessagePersonnelDTO> envoyer(HttpServletRequest req,
                                                       @RequestBody EnvoyerMessageRequest body) {
        String token = token(req);
        Long uid = jwtService.extractUserId(token);
        String nom = jwtService.extractNom(token);
        String role = jwtService.extractRole(token);
        return ResponseEntity.ok(service.envoyer(uid, nom, role, body));
    }

    @PutMapping("/messages/{id}/lu")
    public ResponseEntity<MessagePersonnelDTO> marquerLu(HttpServletRequest req,
                                                         @PathVariable Long id) {
        return ResponseEntity.ok(service.marquerLu(currentUserId(req), id));
    }

    @GetMapping("/messages/non-lus/count")
    public ResponseEntity<Map<String, Long>> countNonLus(HttpServletRequest req) {
        long n = service.countNonLus(currentUserId(req));
        return ResponseEntity.ok(Map.of("count", n));
    }

    @GetMapping("/collegues")
    public ResponseEntity<List<CollegueDTO>> collegues(HttpServletRequest req) {
        return ResponseEntity.ok(service.getCollegues(currentUserId(req)));
    }

    /* ───── Helpers ───── */

    private Long currentUserId(HttpServletRequest req) {
        Long uid = jwtService.extractUserId(token(req));
        if (uid == null) {
            throw new IllegalStateException("userId absent du token. Le compte doit avoir un userId valide.");
        }
        return uid;
    }

    private String token(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) {
            throw new IllegalStateException("Authorization header manquant");
        }
        return h.substring(7);
    }
}
