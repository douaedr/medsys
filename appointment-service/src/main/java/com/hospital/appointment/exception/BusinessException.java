package com.hospital.appointment.exception;

/**
 * Équivalent de InvalidOperationException (.NET) → HTTP 400.
 * Utilisée pour signaler une violation des règles métier.
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
