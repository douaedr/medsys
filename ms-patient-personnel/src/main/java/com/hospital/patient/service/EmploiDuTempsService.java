package com.hospital.patient.service;

import com.hospital.patient.dto.ChefServiceRequest;
import com.hospital.patient.dto.EmploiDuTempsRequest;
import com.hospital.patient.model.ChefService;
import com.hospital.patient.model.EmploiDuTemps;
import com.hospital.patient.repository.ChefServiceRepository;
import com.hospital.patient.repository.EmploiDuTempsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EmploiDuTempsService {

    @Autowired
    private EmploiDuTempsRepository emploiRepo;

    @Autowired
    private ChefServiceRepository chefRepo;

    // â”€â”€ RÃˆGLE MÃ‰TIER : 1 seul chef par service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Nomme un personnel chef d'un service.
     * LÃ¨ve 409 CONFLICT si le service a dÃ©jÃ  un chef diffÃ©rent.
     */
    public ChefService nommerChef(ChefServiceRequest req) {
        chefRepo.findByServiceId(req.getServiceId()).ifPresent(existing -> {
            if (!existing.getPersonnelId().equals(req.getPersonnelId())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Le service '" + req.getServiceId() + "' a dÃ©jÃ  un chef (personnelId="
                        + existing.getPersonnelId() + "). "
                        + "Retirez-le d'abord avant d'en nommer un autre."
                );
            }
        });

        ChefService chef = chefRepo.findByServiceId(req.getServiceId())
            .orElse(new ChefService());
        chef.setPersonnelId(req.getPersonnelId());
        chef.setServiceId(req.getServiceId());
        chef.setNomService(req.getNomService());
        return chefRepo.save(chef);
    }

    /**
     * Retire le chef d'un service (le libÃ¨re pour en nommer un nouveau).
     */
    public void retirerChef(String serviceId) {
        ChefService chef = chefRepo.findByServiceId(serviceId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Aucun chef trouvÃ© pour le service: " + serviceId));
        chefRepo.delete(chef);
    }

    /** Liste tous les chefs de service */
    public List<ChefService> tousLesChefs() {
        return chefRepo.findAll();
    }

    /** VÃ©rifie si un personnel est bien chef du service indiquÃ© */
    public void verifierEstChef(Long personnelId, String serviceId) {
        chefRepo.findByServiceId(serviceId).ifPresentOrElse(chef -> {
            if (!chef.getPersonnelId().equals(personnelId)) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'Ãªtes pas chef du service '" + serviceId + "'."
                );
            }
        }, () -> {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Aucun chef assignÃ© au service '" + serviceId + "'."
            );
        });
    }

    // â”€â”€ EMPLOI DU TEMPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * CrÃ©e un crÃ©neau dans l'emploi du temps.
     * VÃ©rifie que chefServiceId est bien chef du serviceId indiquÃ©.
     */
    public EmploiDuTemps creerCreneau(EmploiDuTempsRequest req, Long chefServiceId) {
        // Validation : le chef doit Ãªtre responsable du service
        verifierEstChef(chefServiceId, req.getServiceId());

        // Validation : heureDebut < heureFin
        if (!req.getHeureDebut().isBefore(req.getHeureFin())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "heureDebut doit Ãªtre avant heureFin.");
        }

        EmploiDuTemps edt = new EmploiDuTemps();
        edt.setPersonnelId(req.getPersonnelId());
        edt.setChefServiceId(chefServiceId);
        edt.setServiceId(req.getServiceId());
        edt.setJourSemaine(req.getJourSemaine().toUpperCase());
        edt.setHeureDebut(req.getHeureDebut());
        edt.setHeureFin(req.getHeureFin());
        edt.setActivite(req.getActivite().toUpperCase());
        edt.setSalle(req.getSalle());
        return emploiRepo.save(edt);
    }

    /** Met Ã  jour un crÃ©neau existant */
    public EmploiDuTemps mettreAJour(Long id, EmploiDuTempsRequest req, Long chefServiceId) {
        EmploiDuTemps edt = emploiRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "CrÃ©neau introuvable: " + id));

        verifierEstChef(chefServiceId, edt.getServiceId());

        if (!req.getHeureDebut().isBefore(req.getHeureFin())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "heureDebut doit Ãªtre avant heureFin.");
        }

        edt.setJourSemaine(req.getJourSemaine().toUpperCase());
        edt.setHeureDebut(req.getHeureDebut());
        edt.setHeureFin(req.getHeureFin());
        edt.setActivite(req.getActivite().toUpperCase());
        edt.setSalle(req.getSalle());
        return emploiRepo.save(edt);
    }

    /** Supprime un crÃ©neau */
    public void supprimerCreneau(Long id, Long chefServiceId) {
        EmploiDuTemps edt = emploiRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "CrÃ©neau introuvable: " + id));
        verifierEstChef(chefServiceId, edt.getServiceId());
        emploiRepo.deleteById(id);
    }

    /** Vue d'un personnel : son emploi du temps complet */
    public List<EmploiDuTemps> getParPersonnel(Long personnelId) {
        return emploiRepo.findByPersonnelId(personnelId);
    }

    /** Vue chef de service : tout son service */
    public List<EmploiDuTemps> getParService(String serviceId) {
        return emploiRepo.findByServiceId(serviceId);
    }

    /** Vue chef de service : tout ce qu'il a planifiÃ© */
    public List<EmploiDuTemps> getParChef(Long chefServiceId) {
        return emploiRepo.findByChefServiceId(chefServiceId);
    }
}
