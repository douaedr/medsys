package com.hospital.patient.dto;

public class ChefServiceRequest {
    private Long personnelId;   // ID du personnel Ã  nommer chef
    private String serviceId;   // Code du service
    private String nomService;  // LibellÃ© du service

    // Getters / Setters
    public Long getPersonnelId() { return personnelId; }
    public void setPersonnelId(Long personnelId) { this.personnelId = personnelId; }
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public String getNomService() { return nomService; }
    public void setNomService(String nomService) { this.nomService = nomService; }
}
