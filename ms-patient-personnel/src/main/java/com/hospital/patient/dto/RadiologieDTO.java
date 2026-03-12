package com.hospital.patient.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RadiologieDTO {
    private Long id;
    private LocalDate dateExamen;
    private String typeExamen;
    private String description;
    private String conclusion;
    private String prescripteur;
    private String radiologue;
}
