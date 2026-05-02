package com.hospital.appointment.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Migré depuis DTOs/Auth/AuthDtos.cs (.NET).
 */
public record RegisterDto(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        String phone
) {}
