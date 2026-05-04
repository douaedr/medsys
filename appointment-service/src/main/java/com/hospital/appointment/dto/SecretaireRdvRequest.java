package com.hospital.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SecretaireRdvRequest {

    @NotNull(message = "L'identifiant du patient est obligatoire")
    private Long patientId;

    @NotNull(message = "L'identifiant du medecin est obligatoire")
    private Long medecinId;

    @NotNull(message = "La date/heure est obligatoire")
    private LocalDateTime dateHeure;

    private String motif;
    private Long slotId;
}