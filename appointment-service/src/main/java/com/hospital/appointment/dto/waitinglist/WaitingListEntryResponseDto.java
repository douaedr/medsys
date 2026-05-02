package com.hospital.appointment.dto.waitinglist;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WaitingListEntryResponseDto(
        Integer id,
        Integer doctorId,
        LocalDate weekStartDate,
        String patientName,
        String email,
        String phone,
        LocalDateTime notifiedAt,
        LocalDateTime createdAt
) {}
