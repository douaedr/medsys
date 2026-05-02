package com.hospital.appointment.exception;

/**
 * Équivalent de UnauthorizedAccessException (.NET) → HTTP 403.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
