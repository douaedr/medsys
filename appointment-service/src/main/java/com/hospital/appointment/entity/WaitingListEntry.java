package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Inscription sur la liste d'attente d'un médecin pour une semaine donnée.
 * Migré depuis Models/WaitingListEntry.cs (.NET).
 *
 * Note : la table est nommée "WaitingList" (singulier) comme dans .NET.
 */
@Entity
@Table(name = "WaitingList", uniqueConstraints = {
        @UniqueConstraint(
                name = "ux_waitinglist_doctor_week_email",
                columnNames = {"doctorId", "weekStartDate", "email"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitingListEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "doctorId", nullable = false)
    private Integer doctorId;

    @Column(nullable = false)
    private LocalDate weekStartDate;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private LocalDateTime notifiedAt;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctorId", referencedColumnName = "id",
            insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User doctor;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
