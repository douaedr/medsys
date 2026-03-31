package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Local copy of appointment data received via RabbitMQ from the appointments
 * microservice. Allows the patient service to answer dashboard queries without
 * synchronous calls to the appointment service.
 */
@Entity
@Table(name = "appointment_records", indexes = {
    @Index(name = "idx_appt_patient", columnList = "patientId"),
    @Index(name = "idx_appt_status",  columnList = "status"),
    @Index(name = "idx_appt_date",    columnList = "appointmentDate")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // External ID from the appointments microservice
    @Column(nullable = false, unique = true)
    private Long externalAppointmentId;

    @Column(nullable = false)
    private Long patientId;

    private Long doctorId;
    private String doctorName;
    private String specialty;

    @Column(nullable = false)
    private LocalDateTime appointmentDate;

    @Column(length = 30)
    private String status;     // SCHEDULED, COMPLETED, CANCELLED

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime recordedAt;

    private LocalDateTime updatedAt;
}
