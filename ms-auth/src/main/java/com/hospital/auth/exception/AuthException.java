package com.hospital.auth.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Auth-domain exception that carries an HTTP status so the global handler
 * can return the right code without needing multiple exception subclasses.
 *
 * Usage:
 *   throw new AuthException("Account locked", HttpStatus.FORBIDDEN);
 *   throw new AuthException("Invalid credentials");   // defaults to 401
 */
@Getter
public class AuthException extends RuntimeException {

    private final HttpStatus status;

    public AuthException(String message) {
        super(message);
        this.status = HttpStatus.UNAUTHORIZED;
    }

    public AuthException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
