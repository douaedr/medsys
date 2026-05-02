package com.hospital.appointment.dto.waitinglist;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record JoinWaitingListDto(
        @NotNull Integer doctorId,
        @NotNull LocalDate weekStartDate,
        @NotBlank String patientName,
        @NotBlank @Email String email,
        String phone
) {}
