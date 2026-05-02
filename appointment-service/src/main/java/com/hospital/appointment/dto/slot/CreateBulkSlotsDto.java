package com.hospital.appointment.dto.slot;

import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Création en masse de créneaux pour une semaine.
 * - weekStartDate : début de semaine (lundi en général)
 * - slotStartTime / slotEndTime : tranche horaire de la journée (ex. 09:00 → 17:00)
 * - slotDurationMinutes : durée d'un créneau (ex. 30)
 * - workDays : jours travaillés (ex. [MONDAY, TUESDAY, ...])
 */
public record CreateBulkSlotsDto(
        @NotNull LocalDate weekStartDate,
        @NotNull LocalTime slotStartTime,
        @NotNull LocalTime slotEndTime,
        @NotNull Integer slotDurationMinutes,
        @NotNull List<DayOfWeek> workDays
) {}
