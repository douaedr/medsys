package com.hospital.appointment.exception;

/**
 * Équivalent de KeyNotFoundException (.NET) → HTTP 404.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
