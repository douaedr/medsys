package com.hospital.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRebookDTO {
    private String originalAppointmentId;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private String notes;
    private String status;
    private LocalDateTime requestedAt;
    private String message;
}