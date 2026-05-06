package com.hospital.patient.controller;

import com.hospital.patient.entity.TacheHygiene;
import com.hospital.patient.service.TacheHygieneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/taches-hygiene")
@CrossOrigin(origins = "*")
public class TacheHygieneController {
    @Autowired
    private TacheHygieneService service;

    @PostMapping
    public ResponseEntity<TacheHygiene> creer(@RequestBody TacheHygiene tache) {
        return ResponseEntity.ok(service.creerTache(tache));
    }
    @GetMapping("/aide-soignant/{id}")
    public ResponseEntity<List<TacheHygiene>> parAideSoignant(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTachesParAideSoignant(id));
    }
    @GetMapping("/infirmier/{id}")
    public ResponseEntity<List<TacheHygiene>> parInfirmier(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTachesParInfirmier(id));
    }
    @PutMapping("/{id}/demarrer")
    public ResponseEntity<TacheHygiene> demarrer(@PathVariable Long id) {
        return ResponseEntity.ok(service.demarrerTache(id));
    }
    @PutMapping("/{id}/valider")
    public ResponseEntity<TacheHygiene> valider(@PathVariable Long id) {
        return ResponseEntity.ok(service.validerTache(id));
    }
}
