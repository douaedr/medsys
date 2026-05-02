package com.hospital.patient.service;

import com.hospital.patient.dto.*;
import com.hospital.patient.entity.CreneauMedecin;
import com.hospital.patient.entity.Medecin;
import com.hospital.patient.entity.Service;
import com.hospital.patient.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ChefServiceManager {

    private final ServiceRepository serviceRepository;
    private final MedecinRepository medecinRepository;
    private final CreneauMedecinRepository creneauRepository;
    private final ConsultationRepository consultationRepository;
    private final AppointmentRecordRepository rendezVousRepository;

    /**
     * Récupère le service dont le médecin connecté est chef.
     */
    public Service getServiceForChef(Long chefPersonnelId) {
        return serviceRepository.findByChefId(chefPersonnelId)
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun service n'est attribué à ce chef (personnelId=" + chefPersonnelId + ")"));
    }

    public List<MedecinSummaryDTO> getMedecinsDuService(Long chefPersonnelId) {
        Service svc = getServiceForChef(chefPersonnelId);
        return medecinRepository.findByService_Id(svc.getId()).stream()
                .map(m -> toMedecinSummary(m, svc))
                .toList();
    }

    public ChefServiceStatsDTO getStats(Long chefPersonnelId) {
        Service svc = getServiceForChef(chefPersonnelId);
        long medecinCount = medecinRepository.findByService_Id(svc.getId()).size();
        long creneauxActifs = creneauRepository.findByServiceIdAndActifTrueOrderByJourAscHeureDebutAsc(svc.getId()).size();

        long consultations = 0;
        long rdvAujourdhui = 0;
        try {
            consultations = consultationRepository.count();
        } catch (Exception ignored) { /* repo peut différer */ }
        try {
            rdvAujourdhui = rendezVousRepository.findAll().stream()
                    .filter(r -> {
                        try {
                            java.lang.reflect.Method m = r.getClass().getMethod("getDateRdv");
                            Object d = m.invoke(r);
                            if (d instanceof java.time.LocalDateTime ldt) return ldt.toLocalDate().equals(LocalDate.now());
                            if (d instanceof LocalDate ld) return ld.equals(LocalDate.now());
                        } catch (Exception ignored) {}
                        return false;
                    }).count();
        } catch (Exception ignored) {}

        return ChefServiceStatsDTO.builder()
                .serviceId(svc.getId())
                .serviceNom(svc.getNom())
                .nombreMedecins(medecinCount)
                .nombreConsultations(consultations)
                .nombreRdvAujourdhui(rdvAujourdhui)
                .nombreCreneauxActifs(creneauxActifs)
                .capaciteLits(svc.getCapaciteLits() != null ? svc.getCapaciteLits() : 0)
                .build();
    }

    public List<CreneauMedecinDTO> getCreneauxDuService(Long chefPersonnelId) {
        Service svc = getServiceForChef(chefPersonnelId);
        return creneauRepository.findByServiceIdOrderByJourAscHeureDebutAsc(svc.getId()).stream()
                .map(this::toCreneauDto)
                .toList();
    }

    public CreneauMedecinDTO creerCreneau(Long chefPersonnelId, CreneauMedecinRequest req) {
        Service svc = getServiceForChef(chefPersonnelId);
        // Le médecin doit appartenir au service du chef
        Medecin medecin = medecinRepository.findById(req.getMedecinId())
                .orElseThrow(() -> new IllegalArgumentException("Médecin introuvable : " + req.getMedecinId()));
        if (medecin.getService() == null || !svc.getId().equals(medecin.getService().getId())) {
            throw new IllegalStateException("Ce médecin n'appartient pas à votre service.");
        }
        if (req.getHeureDebut() == null || req.getHeureFin() == null
                || !req.getHeureFin().isAfter(req.getHeureDebut())) {
            throw new IllegalArgumentException("Heure de fin doit être postérieure à heure de début.");
        }

        CreneauMedecin c = CreneauMedecin.builder()
                .medecinId(req.getMedecinId())
                .serviceId(svc.getId())
                .jour(req.getJour())
                .heureDebut(req.getHeureDebut())
                .heureFin(req.getHeureFin())
                .type(req.getType() != null ? req.getType() : CreneauMedecin.TypeCreneau.CONSULTATION)
                .actif(true)
                .notes(req.getNotes())
                .build();
        c = creneauRepository.save(c);
        return toCreneauDto(c);
    }

    public void supprimerCreneau(Long chefPersonnelId, Long creneauId) {
        Service svc = getServiceForChef(chefPersonnelId);
        CreneauMedecin c = creneauRepository.findById(creneauId)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable : " + creneauId));
        if (!svc.getId().equals(c.getServiceId())) {
            throw new IllegalStateException("Ce créneau n'appartient pas à votre service.");
        }
        creneauRepository.deleteById(creneauId);
    }

    public List<CreneauMedecinDTO> getCreneauxMedecin(Long medecinId) {
        return creneauRepository.findByMedecinIdOrderByJourAscHeureDebutAsc(medecinId).stream()
                .map(this::toCreneauDto)
                .toList();
    }

    /* ───────────────────────── Mappers ───────────────────────── */

    private MedecinSummaryDTO toMedecinSummary(Medecin m, Service svc) {
        boolean estChef = svc.getChefId() != null && svc.getChefId().equals(m.getId());
        return MedecinSummaryDTO.builder()
                .id(m.getId())
                .nom(m.getNom())
                .prenom(m.getPrenom())
                .matricule(m.getMatricule())
                .specialite(m.getSpecialite() != null ? safeNom(m.getSpecialite()) : null)
                .serviceNom(svc.getNom())
                .estChef(estChef)
                .build();
    }

    private CreneauMedecinDTO toCreneauDto(CreneauMedecin c) {
        String medecinNom = null;
        Optional<Medecin> medOpt = medecinRepository.findById(c.getMedecinId());
        if (medOpt.isPresent()) {
            Medecin m = medOpt.get();
            medecinNom = "Dr. " + (m.getPrenom() != null ? m.getPrenom() + " " : "") + (m.getNom() != null ? m.getNom() : "");
        }
        return CreneauMedecinDTO.builder()
                .id(c.getId())
                .medecinId(c.getMedecinId())
                .medecinNom(medecinNom)
                .serviceId(c.getServiceId())
                .jour(c.getJour())
                .heureDebut(c.getHeureDebut())
                .heureFin(c.getHeureFin())
                .type(c.getType())
                .actif(c.getActif())
                .notes(c.getNotes())
                .build();
    }

    private String safeNom(Object specialite) {
        try {
            java.lang.reflect.Method m = specialite.getClass().getMethod("getNom");
            Object r = m.invoke(specialite);
            return r != null ? r.toString() : null;
        } catch (Exception e) {
            return specialite.toString();
        }
    }
}
