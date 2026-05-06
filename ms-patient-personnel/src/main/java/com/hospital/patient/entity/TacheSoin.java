package com.hospital.patient.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tache_soin")
public class TacheSoin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String description;
    private String priorite;
    private Long medecinId;
    private Long infirmierId;
    private Long patientId;
    private String statut;
    private LocalDateTime dateAssignation;
    private LocalDateTime dateValidation;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }
    public Long getMedecinId() { return medecinId; }
    public void setMedecinId(Long medecinId) { this.medecinId = medecinId; }
    public Long getInfirmierId() { return infirmierId; }
    public void setInfirmierId(Long infirmierId) { this.infirmierId = infirmierId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public LocalDateTime getDateAssignation() { return dateAssignation; }
    public void setDateAssignation(LocalDateTime d) { this.dateAssignation = d; }
    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime d) { this.dateValidation = d; }
}
