package com.hospital.patient.controller;

import com.hospital.patient.dto.ChefServiceRequest;
import com.hospital.patient.dto.EmploiDuTempsRequest;
import com.hospital.patient.model.ChefService;
import com.hospital.patient.model.EmploiDuTemps;
import com.hospital.patient.service.EmploiDuTempsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * EmploiDuTempsController
 *
 * Base URL : /api/chef
 *
 * â”€â”€ Gestion des chefs de service â”€â”€
 *   POST   /api/chef/nommer            â†’ nommer un chef (rÃ¨gle 1 chef/service, 409 si doublon)
 *   DELETE /api/chef/retirer/{service} â†’ retirer le chef d'un service
 *   GET    /api/chef/liste             â†’ liste tous les chefs
 *
 * â”€â”€ Emploi du temps â”€â”€
 *   POST   /api/chef/edt                         â†’ crÃ©er un crÃ©neau
 *   PUT    /api/chef/edt/{id}                    â†’ modifier un crÃ©neau
 *   DELETE /api/chef/edt/{id}?chefId=X           â†’ supprimer un crÃ©neau
 *   GET    /api/chef/edt/service/{serviceId}      â†’ planning complet d'un service
 *   GET    /api/chef/edt/personnel/{personnelId}  â†’ planning d'un personnel
 *   GET    /api/chef/edt/chef/{chefId}            â†’ tout ce qu'un chef a planifiÃ©
 *
 * Note : l'ID du chef est passÃ© en header X-Chef-Id pour simplifier
 *        (pas de Spring Security configurÃ© dans ce micro-service).
 */
@RestController
@RequestMapping("/api/chef")
@CrossOrigin(origins = "http://localhost:5173")
public class EmploiDuTempsController {

    @Autowired
    private EmploiDuTempsService service;

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    //  GESTION DES CHEFS DE SERVICE
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    /**
     * Nommer un personnel chef d'un service.
     * 409 CONFLICT si le service a dÃ©jÃ  un chef diffÃ©rent.
     */
    @PostMapping("/nommer")
    public ResponseEntity<ChefService> nommerChef(@RequestBody ChefServiceRequest req) {
        return ResponseEntity.ok(service.nommerChef(req));
    }

    /**
     * Retirer le chef d'un service (libÃ¨re le poste).
     */
    @DeleteMapping("/retirer/{serviceId}")
    public ResponseEntity<String> retirerChef(@PathVariable String serviceId) {
        service.retirerChef(serviceId);
        return ResponseEntity.ok("Chef du service '" + serviceId + "' retirÃ© avec succÃ¨s.");
    }

    /**
     * Liste tous les chefs de service.
     */
    @GetMapping("/liste")
    public ResponseEntity<List<ChefService>> listeChefs() {
        return ResponseEntity.ok(service.tousLesChefs());
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    //  EMPLOI DU TEMPS
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    /**
     * CrÃ©er un crÃ©neau dans l'emploi du temps.
     * Le chef doit envoyer son ID dans le header X-Chef-Id.
     */
    @PostMapping("/edt")
    public ResponseEntity<EmploiDuTemps> creerCreneau(
            @RequestBody EmploiDuTempsRequest req,
            @RequestHeader("X-Chef-Id") Long chefId) {
        return ResponseEntity.ok(service.creerCreneau(req, chefId));
    }

    /**
     * Modifier un crÃ©neau existant.
     */
    @PutMapping("/edt/{id}")
    public ResponseEntity<EmploiDuTemps> modifierCreneau(
            @PathVariable Long id,
            @RequestBody EmploiDuTempsRequest req,
            @RequestHeader("X-Chef-Id") Long chefId) {
        return ResponseEntity.ok(service.mettreAJour(id, req, chefId));
    }

    /**
     * Supprimer un crÃ©neau.
     */
    @DeleteMapping("/edt/{id}")
    public ResponseEntity<String> supprimerCreneau(
            @PathVariable Long id,
            @RequestHeader("X-Chef-Id") Long chefId) {
        service.supprimerCreneau(id, chefId);
        return ResponseEntity.ok("CrÃ©neau " + id + " supprimÃ©.");
    }

    /**
     * Planning complet d'un service (vue chef de service).
     */
    @GetMapping("/edt/service/{serviceId}")
    public ResponseEntity<List<EmploiDuTemps>> planningService(@PathVariable String serviceId) {
        return ResponseEntity.ok(service.getParService(serviceId));
    }

    /**
     * Planning d'un personnel (vue "Mon emploi du temps").
     */
    @GetMapping("/edt/personnel/{personnelId}")
    public ResponseEntity<List<EmploiDuTemps>> planningPersonnel(@PathVariable Long personnelId) {
        return ResponseEntity.ok(service.getParPersonnel(personnelId));
    }

    /**
     * Tout ce qu'un chef a planifiÃ©.
     */
    @GetMapping("/edt/chef/{chefId}")
    public ResponseEntity<List<EmploiDuTemps>> planningChef(@PathVariable Long chefId) {
        return ResponseEntity.ok(service.getParChef(chefId));
    }
}
