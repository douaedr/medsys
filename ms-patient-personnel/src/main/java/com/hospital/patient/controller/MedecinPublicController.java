package com.hospital.patient.controller;

import com.hospital.patient.repository.MedecinRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 🔧 NEW: Controller pour exposer la liste publique des médecins.
 *
 * Endpoint accessible à TOUS les utilisateurs authentifiés (Patient inclus),
 * permettant au frontend de proposer un sélecteur de médecin
 * (par exemple pour la messagerie patient → médecin).
 *
 * Renvoie uniquement des informations non sensibles :
 * - id
 * - nom complet
 * - spécialité
 * - service
 *
 * Ne JAMAIS exposer email, téléphone, adresse, etc. ici (info privée).
 */
@RestController
@RequestMapping("/api/v1/medecins")
@CrossOrigin(origins = "*")
public class MedecinPublicController {

    private final MedecinRepository medecinRepository;

    public MedecinPublicController(MedecinRepository medecinRepository) {
        this.medecinRepository = medecinRepository;
    }

    /**
     * GET /api/v1/medecins
     * Liste de tous les médecins (informations publiques).
     */
    @GetMapping
    public List<Map<String, Object>> getAllMedecins() {
        return medecinRepository.findAll().stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("nom", m.getNom());
                    map.put("prenom", m.getPrenom());
                    map.put("nomComplet", m.getNomComplet());
                    map.put("matricule", m.getMatricule());
                    map.put("specialite", m.getSpecialite() != null ? m.getSpecialite().getNom() : null);
                    map.put("service", m.getService() != null ? m.getService().getNom() : null);
                    return map;
                })
                .collect(Collectors.toList());
    }
}
