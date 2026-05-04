package com.hospital.patient.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chef_service")
public class ChefService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long personnelId;

    @Column(name = "service_id", nullable = false, unique = true)
    private String serviceId;

    private String nomService;

    public Long getId() { return id; }
    public Long getPersonnelId() { return personnelId; }
    public void setPersonnelId(Long personnelId) { this.personnelId = personnelId; }
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public String getNomService() { return nomService; }
    public void setNomService(String nomService) { this.nomService = nomService; }
}