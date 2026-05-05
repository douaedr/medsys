package com.hospital.patient.controller;

import com.hospital.patient.model.FicheTransport;
import com.hospital.patient.service.FicheTransportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
@RequiredArgsConstructor
public class FicheTransportController {

    private final FicheTransportService service;

    @PostMapping
    public ResponseEntity<FicheTransport> creer(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(service.creer(body));
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<FicheTransport>> getEnAttente() {
        return ResponseEntity.ok(service.getEnAttente());
    }

    @GetMapping("/infirmier/{id}")
    public ResponseEntity<List<FicheTransport>> getByInfirmier(@PathVariable Long id) {
        return ResponseEntity.ok(service.getByInfirmier(id));
    }

    @GetMapping("/brancardier/{id}")
    public ResponseEntity<List<FicheTransport>> getByBrancardier(@PathVariable Long id) {
        return ResponseEntity.ok(service.getByBrancardier(id));
    }

    @PutMapping("/{id}/prendre-en-charge")
    public ResponseEntity<FicheTransport> prendreEnCharge(
            @PathVariable Long id,
            @RequestHeader("X-Brancardier-Id") Long brancardierId) {
        return ResponseEntity.ok(service.prendreEnCharge(id, brancardierId));
    }

    @PutMapping("/{id}/terminer")
    public ResponseEntity<FicheTransport> terminer(
            @PathVariable Long id,
            @RequestHeader("X-Brancardier-Id") Long brancardierId) {
        return ResponseEntity.ok(service.terminer(id, brancardierId));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<FicheTransport> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(service.annuler(id));
    }

    @GetMapping
    public ResponseEntity<List<FicheTransport>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
