package com.hospital.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_email", columnList = "email"),
    @Index(name = "idx_audit_event", columnList = "eventType"),
    @Index(name = "idx_audit_created", columnList = "createdAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String eventType;   // LOGIN_SUCCESS, LOGIN_FAILURE, REGISTRATION, ACCOUNT_LOCKED, etc.

    @Column(nullable = false)
    private String email;

    private String ipAddress;

    @Column(length = 500)
    private String details;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
