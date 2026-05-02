package com.hospital.appointment.dto.appointment;

import jakarta.validation.constraints.NotNull;

/**
 * Migré depuis DTOs/Appointment/AppointmentDtos.cs (.NET).
 *
 * Patient connecté → envoyer uniquement timeSlotId + reason.
 * Patient anonyme  → envoyer aussi patientName, patientEmail, patientPhone.
 */
public record BookAppointmentDto(
        @NotNull Integer timeSlotId,
        String reason,
        // Champs requis uniquement si le patient est anonyme (non connecté)
        String patientName,
        String patientEmail,
        String patientPhone
) {}
