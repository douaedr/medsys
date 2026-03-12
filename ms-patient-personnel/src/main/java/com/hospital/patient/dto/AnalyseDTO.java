package com.hospital.patient.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyseDTO {
    private Long id;
    private LocalDate dateAnalyse;
    private LocalDate dateResultat;
    private String typeAnalyse;
    private String resultats;
    private String valeurReference;
    private String statut;
    private String laboratoire;
    private String prescripteur;
}
