package com.hospital.appointment.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStaffDto(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        String phone,
        @NotBlank String role   // "Doctor" ou "Secretary"
) {}
