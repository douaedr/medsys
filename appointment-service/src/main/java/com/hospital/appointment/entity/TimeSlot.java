package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Créneau horaire réservable.
 * Migré depuis Models/TimeSlot.cs (.NET).
 *
 * Note : DoctorId est nullable pour les créneaux hospitaliers
 * (Analyses, Radiologie, Scanner → DoctorId = NULL, ServiceId rempli).
 */
@Entity
@Table(name = "TimeSlots", indexes = {
        @Index(name = "ix_timeslots_doctor_start", columnList = "doctorId, startTime")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Nullable pour les créneaux hospitaliers (services sans médecin). */
    @Column(name = "doctorId")
    private Integer doctorId;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SlotStatus status = SlotStatus.Available;

    /** Pour les créneaux hospitaliers (non-spécialités). */
    @Column(name = "serviceId")
    private Integer serviceId;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ── Navigation ──────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctorId", referencedColumnName = "id",
            insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serviceId", referencedColumnName = "id",
            insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private MedicalService service;

    @OneToOne(mappedBy = "timeSlot", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Appointment appointment;

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
