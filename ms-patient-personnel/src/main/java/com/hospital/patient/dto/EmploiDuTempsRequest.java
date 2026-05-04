package com.hospital.patient.dto;

import java.time.LocalTime;

public class EmploiDuTempsRequest {
    private Long personnelId;
    private String serviceId;
    private String jourSemaine;   // LUNDI | MARDI | ...
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String activite;      // CONSULTATION | GARDE | REUNION | REPOS | AUTRE
    private String salle;

    // Getters / Setters
    public Long getPersonnelId() { return personnelId; }
    public void setPersonnelId(Long personnelId) { this.personnelId = personnelId; }
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
