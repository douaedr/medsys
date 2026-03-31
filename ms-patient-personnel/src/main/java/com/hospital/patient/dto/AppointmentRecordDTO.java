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
public class AppointmentRecordDTO {
    private Long id;
    private Long externalAppointmentId;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private LocalDateTime appointmentDate;
    private String status;
    private String notes;
    private LocalDateTime recordedAt;
}
