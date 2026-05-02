package com.hospital.patient.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChefServiceStatsDTO {
    private Long serviceId;
    private String serviceNom;
    private long nombreMedecins;
    private long nombreConsultations;
    private long nombreRdvAujourdhui;
    private long nombreCreneauxActifs;
    private long capaciteLits;
}
