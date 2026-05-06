package com.hospital.patient.service;

import com.hospital.patient.entity.TacheHygiene;
import com.hospital.patient.repository.TacheHygieneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TacheHygieneService {
    @Autowired
    private TacheHygieneRepository repo;

    public TacheHygiene creerTache(TacheHygiene tache) {
        tache.setStatut("EN_ATTENTE");
        tache.setDateAssignation(LocalDateTime.now());
        return repo.save(tache);
    }
    public List<TacheHygiene> getTachesParAideSoignant(Long id) {
        return repo.findByAideSoignantId(id);
    }
    public List<TacheHygiene> getTachesParInfirmier(Long id) {
        return repo.findByInfirmierId(id);
    }
    public TacheHygiene demarrerTache(Long id) {
        TacheHygiene t = repo.findById(id).orElseThrow();
        t.setStatut("EN_COURS");
        return repo.save(t);
    }
    public TacheHygiene validerTache(Long id) {
        TacheHygiene t = repo.findById(id).orElseThrow();
        t.setStatut("VALIDEE");
        t.setDateValidation(LocalDateTime.now());
        return repo.save(t);
    }
}
