package com.hospital.patient.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tache_hygiene")
public class TacheHygiene {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String description;
    private String categorie;
    private Long infirmierId;
    private Long aideSoignantId;
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
    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }
    public Long getInfirmierId() { return infirmierId; }
    public void setInfirmierId(Long id) { this.infirmierId = id; }
    public Long getAideSoignantId() { return aideSoignantId; }
    public void setAideSoignantId(Long id) { this.aideSoignantId = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long id) { this.patientId = id; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public LocalDateTime getDateAssignation() { return dateAssignation; }
    public void setDateAssignation(LocalDateTime d) { this.dateAssignation = d; }
    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime d) { this.dateValidation = d; }
}
