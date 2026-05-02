package com.hospital.appointment.dto.appointment;

import jakarta.validation.constraints.NotNull;

public record UpdateAppointmentDto(
        @NotNull Integer appointmentId,
        @NotNull Integer newTimeSlotId,
        String reason
) {}
