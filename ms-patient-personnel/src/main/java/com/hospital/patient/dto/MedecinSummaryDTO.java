package com.hospital.patient.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedecinSummaryDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String matricule;
    private String specialite;
    private String serviceNom;
    private boolean estChef;
}
