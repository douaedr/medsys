package com.hospital.patient.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "emploi_du_temps")
public class EmploiDuTemps {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long personnelId;

    @Column(nullable = false)
    private Long chefServiceId;

    @Column(nullable = false)
    private String serviceId;

    @Column(nullable = false)
    private String jourSemaine;

    @Column(nullable = false)
    private LocalTime heureDebut;

    @Column(nullable = false)
    private LocalTime heureFin;

    @Column(nullable = false)
    private String activite;

    private String salle;

    public Long getId() { return id; }
    public Long getPersonnelId() { return personnelId; }
    public void setPersonnelId(Long personnelId) { this.personnelId = personnelId; }
    public Long getChefServiceId() { return chefServiceId; }
    public void setChefServiceId(Long chefServiceId) { this.chefServiceId = chefServiceId; }
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public String getJourSemaine() { return jourSemaine; }
    public void setJourSemaine(String jourSemaine) { this.jourSemaine = jourSemaine; }
    public LocalTime getHeureDebut() { return heureDebut; }
    public void setHeureDebut(LocalTime heureDebut) { this.heureDebut = heureDebut; }
    public LocalTime getHeureFin() { return heureFin; }
    public void setHeureFin(LocalTime heureFin) { this.heureFin = heureFin; }
    public String getActivite() { return activite; }
    public void setActivite(String activite) { this.activite = activite; }
    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }
}