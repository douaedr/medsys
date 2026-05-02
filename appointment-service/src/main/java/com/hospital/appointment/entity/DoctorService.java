package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * Table de liaison entre un médecin et un service hospitalier.
 * Migré depuis Models/Service.cs (DoctorService class) (.NET).
 */
@Entity
@Table(name = "DoctorServices")
@IdClass(DoctorService.DoctorServiceId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorService {

    @Id
    @Column(name = "doctorId")
    private Integer doctorId;

    @Id
    @Column(name = "serviceId")
    private Integer serviceId;

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

    /**
     * Clé primaire composite.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorServiceId implements Serializable {
        private Integer doctorId;
        private Integer serviceId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof DoctorServiceId that)) return false;
            return Objects.equals(doctorId, that.doctorId)
                    && Objects.equals(serviceId, that.serviceId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(doctorId, serviceId);
        }
    }
}
