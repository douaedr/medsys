package com.hospital.appointment.dto.slot;

import java.time.LocalDateTime;

/**
 * FIX Bug 1 : DTO pour les créneaux hospitaliers
 * (Analyses / Radiologie / Scanner).
 */
public record HospitalSlotResponseDto(
        Integer id,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status,
        boolean isClickable,
        Integer serviceId,
        String serviceName
) {}
