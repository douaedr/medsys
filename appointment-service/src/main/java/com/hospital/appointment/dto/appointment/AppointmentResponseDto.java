package com.hospital.appointment.dto.appointment;

import java.time.LocalDateTime;

public record AppointmentResponseDto(
        Integer id,
        Integer timeSlotId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String patientName,
        String patientEmail,
        String status,
        String anonymousToken,   // renvoyé UNE SEULE FOIS lors de la réservation anonyme
        LocalDateTime createdAt,
        // FIX Bug 2 : champs ajoutés pour affichage côté patient et médecin
        String doctorName,
        String reason,
        String cancelReason
) {}
