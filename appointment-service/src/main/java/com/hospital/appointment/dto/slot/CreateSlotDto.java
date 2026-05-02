package com.hospital.appointment.dto.slot;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateSlotDto(
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime
) {}
