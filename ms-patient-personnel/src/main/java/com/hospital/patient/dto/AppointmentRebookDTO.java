package com.hospital.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Returned after a rebook request is accepted and forwarded via RabbitMQ.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRebookDTO {
    private Long originalAppointmentId;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private String notes;
    private String status;          // REBOOK_REQUESTED
    private LocalDateTime requestedAt;
    private String message;
}
