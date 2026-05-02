package com.hospital.patient.dto;

import lombok.Data;

@Data
public class CreerRdvRequest {
    private Long medecinId;
    private String dateHeure;  // format "2026-05-05T09:00:00"
    private String motif;
}
