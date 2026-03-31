package com.hospital.auth.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Uniform error envelope returned by every error path.
 *
 * {
 *   "status": 401,
 *   "error": "Unauthorized",
 *   "message": "Invalid credentials",
 *   "timestamp": "2026-03-31T12:00:00",
 *   "fields": { "email": "must not be blank" }   // only present on validation errors
 * }
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private final int status;
    private final String error;
    private final String message;
    private final LocalDateTime timestamp;
    private final Map<String, String> fields;

    public static ErrorResponse of(int status, String error, String message) {
        return ErrorResponse.builder()
                .status(status)
                .error(error)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse ofFields(Map<String, String> fields) {
        return ErrorResponse.builder()
                .status(400)
                .error("Bad Request")
                .message("Validation failed. Check the 'fields' map for details.")
                .timestamp(LocalDateTime.now())
                .fields(fields)
                .build();
    }
}
