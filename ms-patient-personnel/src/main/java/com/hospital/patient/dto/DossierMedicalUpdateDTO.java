package com.hospital.patient.dto;

import com.hospital.patient.enums.NiveauSeverite;
import com.hospital.patient.enums.TypeAntecedent;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalUpdateDTO {

    private String observations;
    private String allergies;
    private String traitementsEnCours;
    private List<AntecedentItemDTO> antecedents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AntecedentItemDTO {
        private Long id;
        private TypeAntecedent typeAntecedent;
        private String description;
        private LocalDate dateDiagnostic;
        private NiveauSeverite severite;
        private Boolean actif;
        private String source;
    }
}