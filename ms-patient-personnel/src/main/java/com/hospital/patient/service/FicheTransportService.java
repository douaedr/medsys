package com.hospital.patient.service;

import com.hospital.patient.model.FicheTransport;
import com.hospital.patient.repository.FicheTransportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FicheTransportService {

    private final FicheTransportRepository repo;

    public FicheTransport creer(Map<String, Object> body) {
        FicheTransport fiche = FicheTransport.builder()
            .patientId(Long.valueOf(body.get("patientId").toString()))
            .patientNom(body.get("patientNom").toString())
            .patientPrenom(body.get("patientPrenom").toString())
            .infirmierId(Long.valueOf(body.get("infirmierId").toString()))
            .serviceDepart(body.get("serviceDepart").toString())
            .serviceArrivee(body.get("serviceArrivee").toString())
            .motif(body.get("motif").toString())
            .urgence(Boolean.parseBoolean(body.getOrDefault("urgence", false).toString()))
            .notes(body.containsKey("notes") ? body.get("notes").toString() : null)
            .build();
        return repo.save(fiche);
    }

    public List<FicheTransport> getEnAttente() {
        return repo.findByStatutOrderByUrgenceDescCreatedAtAsc(FicheTransport.Statut.EN_ATTENTE);
    }

    public List<FicheTransport> getByInfirmier(Long infirmierId) {
        return repo.findByInfirmierId(infirmierId);
    }

    public List<FicheTransport> getByBrancardier(Long brancardlerId) {
        return repo.findByBrancardlerId(brancardlerId);
    }

    public FicheTransport prendreEnCharge(Long id, Long brancardlerId) {
        FicheTransport fiche = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiche introuvable"));
        if (fiche.getStatut() != FicheTransport.Statut.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fiche deja prise en charge");
        }
        fiche.setBrancardlerId(brancardlerId);
        fiche.setStatut(FicheTransport.Statut.EN_COURS);
        return repo.save(fiche);
    }

    public FicheTransport terminer(Long id, Long brancardlerId) {
        FicheTransport fiche = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiche introuvable"));
        if (!brancardlerId.equals(fiche.getBrancardlerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Non autorise");
        }
        fiche.setStatut(FicheTransport.Statut.TERMINE);
        return repo.save(fiche);
    }

    public FicheTransport annuler(Long id) {
        FicheTransport fiche = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiche introuvable"));
        fiche.setStatut(FicheTransport.Statut.ANNULE);
        return repo.save(fiche);
    }

    public List<FicheTransport> getAll() {
        return repo.findAll();
    }
}
