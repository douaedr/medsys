package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_doctors",
        uniqueConstraints = @UniqueConstraint(columnNames = {"patient_id", "doctor_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDoctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    // References the doctor by their auth userId (ms-auth) or internal doctorId
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(length = 100)
    private String doctorName;

    @Column(length = 100)
    private String specialty;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime addedAt;
}
