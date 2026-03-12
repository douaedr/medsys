package com.hospital.patient.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdonnanceDTO {
    private Long id;
    private LocalDate dateOrdonnance;
    private String typeOrdonnance;
    private String instructions;
    private Boolean estRenouvele;
    private LocalDate dateExpiration;
    private String medecinNomComplet;
    private List<LigneOrdonnanceDTO> lignes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneOrdonnanceDTO {
        private Long id;
        private String medicament;
        private String dosage;
        private String posologie;
        private Integer dureeJours;
        private Integer quantite;
        private String instructions;
    }
}
