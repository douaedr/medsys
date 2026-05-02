package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Journal d'audit pour tracer les actions importantes (réservations, annulations, etc.).
 * Migré depuis Models/AuditLog.cs (.NET).
 */
@Entity
@Table(name = "AuditLogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** ID de l'utilisateur qui a effectué l'action (nullable pour actions anonymes). */
    private Integer userId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private Integer entityId;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
