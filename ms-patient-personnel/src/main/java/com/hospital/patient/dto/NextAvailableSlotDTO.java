package com.hospital.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Suggested next appointment slot returned to the patient.
 * The slot is derived from local appointment-history patterns and
 * favorite-doctor preferences — no synchronous call to the .NET
 * appointment service is needed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextAvailableSlotDTO {
    private Long suggestedDoctorId;
    private String suggestedDoctorName;
    private String specialty;
    private LocalDateTime suggestedDate;   // estimated next appointment window
    private String suggestionBasis;        // "LAST_APPOINTMENT_INTERVAL" | "FAVORITE_DOCTOR" | "NO_DATA"
    private String message;
}
