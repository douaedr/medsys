package com.hospital.patient.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {

    private Long id;
    private String numeroDossier;
    private LocalDateTime dateCreation;
    private PatientResponseDTO patient;
    private List<ConsultationDTO> consultations;
    private List<AntecedentDTO> antecedents;
    private List<OrdonnanceDTO> ordonnances;
    private List<AnalyseDTO> analyses;
    private List<RadiologieDTO> radiologies;
}
