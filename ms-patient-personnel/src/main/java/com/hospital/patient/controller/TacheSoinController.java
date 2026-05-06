package com.hospital.patient.controller;

import com.hospital.patient.entity.TacheSoin;
import com.hospital.patient.service.TacheSoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/taches-soin")
@CrossOrigin(origins = "*")
public class TacheSoinController {
    @Autowired
    private TacheSoinService service;

    @PostMapping
    public ResponseEntity<TacheSoin> creer(@RequestBody TacheSoin tache) {
        return ResponseEntity.ok(service.creerTache(tache));
    }
    @GetMapping("/infirmier/{id}")
    public ResponseEntity<List<TacheSoin>> parInfirmier(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTachesParInfirmier(id));
    }
    @GetMapping("/medecin/{id}")
    public ResponseEntity<List<TacheSoin>> parMedecin(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTachesParMedecin(id));
    }
    @PutMapping("/{id}/valider")
    public ResponseEntity<TacheSoin> valider(@PathVariable Long id) {
        return ResponseEntity.ok(service.validerTache(id));
    }
    @PutMapping("/{id}/demarrer")
    public ResponseEntity<TacheSoin> demarrer(@PathVariable Long id) {
        return ResponseEntity.ok(service.demarrerTache(id));
    }
    @GetMapping("/infirmier/{id}/en-attente")
    public ResponseEntity<List<TacheSoin>> enAttente(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTachesEnAttente(id));
    }
}
