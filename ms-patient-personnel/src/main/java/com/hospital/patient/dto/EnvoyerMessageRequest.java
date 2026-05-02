package com.hospital.patient.dto;

import com.hospital.patient.entity.MessagePersonnel;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvoyerMessageRequest {
    private Long destinataireId;
    private String contenu;
    private MessagePersonnel.Priorite priorite;
    private Long medecinId;
    private String medecinNom;
}
