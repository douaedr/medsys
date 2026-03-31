package com.hospital.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDoctorDTO {
    private Long id;

    @NotNull(message = "doctorId est obligatoire")
    private Long doctorId;

    private String doctorName;
    private String specialty;
    private LocalDateTime addedAt;
}
