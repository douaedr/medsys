package com.hospital.appointment.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Gestionnaire global d'exceptions.
 * Migré depuis Middlewares/ExceptionMiddleware.cs (.NET).
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.FORBIDDEN, ex);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex) {
        return build(HttpStatus.BAD_REQUEST, ex);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegal(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, ex);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Données invalides");
        return build(HttpStatus.BAD_REQUEST, "ValidationException", msg);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception ex) {
        log.error("Exception non gérée : {}", ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ex);
    }

    // ── helpers ──────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> build(HttpStatus status, Exception ex) {
        return build(status, ex.getClass().getSimpleName(), ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String type, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("message", message);
        body.put("type", type);
        return ResponseEntity.status(status).body(body);
    }
}
