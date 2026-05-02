package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Rendez-vous médical.
 * Migré depuis Models/Appointment.cs (.NET).
 */
@Entity
@Table(name = "Appointments", indexes = {
        @Index(name = "ux_appointments_timeslot", columnList = "timeSlotId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "timeSlotId", nullable = false, unique = true)
    private Integer timeSlotId;

    @Column(name = "patientId", nullable = false)
    private Integer patientId;

    @Column(name = "bookedById", nullable = false)
    private Integer bookedById;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.Confirmed;

    /** Token unique pour permettre l'annulation par un patient anonyme. */
    private String anonymousToken;

    private LocalDateTime cancelledAt;

    private String cancelReason;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ── Navigation ──────────────────────────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timeSlotId", referencedColumnName = "id",
            insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TimeSlot timeSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patientId", referencedColumnName = "id",
            insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookedById", referencedColumnName = "id",
            insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User bookedBy;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
