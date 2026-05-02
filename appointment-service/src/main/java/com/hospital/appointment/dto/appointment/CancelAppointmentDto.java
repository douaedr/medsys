package com.hospital.appointment.dto.appointment;

import jakarta.validation.constraints.NotNull;

public record CancelAppointmentDto(
        @NotNull Integer appointmentId,
        String cancelReason,
        String anonymousToken   // si patient non inscrit
) {}
