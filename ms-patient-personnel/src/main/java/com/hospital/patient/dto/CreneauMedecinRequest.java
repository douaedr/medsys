package com.hospital.patient.dto;

import com.hospital.patient.entity.CreneauMedecin;
import lombok.*;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreneauMedecinRequest {
    private Long medecinId;
    private CreneauMedecin.JourSemaine jour;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private CreneauMedecin.TypeCreneau type;
    private String notes;
}
