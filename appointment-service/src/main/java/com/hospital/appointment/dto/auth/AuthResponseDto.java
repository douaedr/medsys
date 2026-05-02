package com.hospital.appointment.dto.auth;

import java.time.LocalDateTime;

public record AuthResponseDto(
        String token,
        String role,
        String fullName,
        LocalDateTime expiresAt
) {}
