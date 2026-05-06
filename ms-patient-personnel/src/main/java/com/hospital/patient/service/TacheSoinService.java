package com.hospital.patient.service;

import com.hospital.patient.entity.TacheSoin;
import com.hospital.patient.repository.TacheSoinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TacheSoinService {
    @Autowired
    private TacheSoinRepository repo;

    public TacheSoin creerTache(TacheSoin tache) {
        tache.setStatut("EN_ATTENTE");
        tache.setDateAssignation(LocalDateTime.now());
        return repo.save(tache);
    }
    public List<TacheSoin> getTachesParInfirmier(Long infirmierId) {
        return repo.findByInfirmierId(infirmierId);
    }
    public List<TacheSoin> getTachesParMedecin(Long medecinId) {
        return repo.findByMedecinId(medecinId);
    }
    public TacheSoin validerTache(Long id) {
        TacheSoin t = repo.findById(id).orElseThrow();
        t.setStatut("VALIDEE");
        t.setDateValidation(LocalDateTime.now());
        return repo.save(t);
    }
    public TacheSoin demarrerTache(Long id) {
        TacheSoin t = repo.findById(id).orElseThrow();
        t.setStatut("EN_COURS");
        return repo.save(t);
    }
    public List<TacheSoin> getTachesEnAttente(Long infirmierId) {
        return repo.findByInfirmierIdAndStatut(infirmierId, "EN_ATTENTE");
    }
}
