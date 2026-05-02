package com.hospital.patient.dto;

import com.hospital.patient.entity.MessagePersonnel;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagePersonnelDTO {
    private Long id;
    private Long expediteurId;
    private String expediteurNom;
    private String expediteurRole;
    private Long destinataireId;
    private String destinataireNom;
    private String destinataireRole;
    private String contenu;
    private Boolean lu;
    private LocalDateTime dateEnvoi;
    private LocalDateTime dateLecture;
    private MessagePersonnel.Priorite priorite;
}
