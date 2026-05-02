package com.hospital.appointment.dto.slot;

import java.time.LocalDateTime;

/**
 * FIX Bug 3 : patientName, patientEmail, appointmentId ajoutés
 * pour le calendrier médecin.
 */
public record TimeSlotResponseDto(
        Integer id,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status,
        boolean isClickable,
        String patientName,
        String patientEmail,
        Integer appointmentId
) {}
