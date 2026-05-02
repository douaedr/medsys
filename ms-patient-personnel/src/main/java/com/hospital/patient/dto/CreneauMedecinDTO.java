package com.hospital.patient.dto;

import com.hospital.patient.entity.CreneauMedecin;
import lombok.*;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreneauMedecinDTO {
    private Long id;
    private Long medecinId;
    private String medecinNom;
    private Long serviceId;
    private CreneauMedecin.JourSemaine jour;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private CreneauMedecin.TypeCreneau type;
    private Boolean actif;
    private String notes;
}
