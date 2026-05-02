package com.hospital.patient.controller;

import com.hospital.patient.dto.OrganigrammeDTO;
import com.hospital.patient.service.OrganigrammeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * FEAT 5 — Organigramme hiérarchique.
 * Accessible aux DIRECTEUR, ADMIN, CHEF_SERVICE.
 */
@RestController
@RequestMapping("/api/v1/organigramme")
@RequiredArgsConstructor
public class OrganigrammeController {

    private final OrganigrammeService organigrammeService;

    @GetMapping
    public ResponseEntity<OrganigrammeDTO> get() {
        return ResponseEntity.ok(organigrammeService.build());
    }
}
