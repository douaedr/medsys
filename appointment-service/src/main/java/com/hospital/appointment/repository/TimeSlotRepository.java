package com.hospital.appointment.repository;

import com.hospital.appointment.entity.SlotStatus;
import com.hospital.appointment.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {

    @Query("""
            SELECT t FROM TimeSlot t
            LEFT JOIN FETCH t.appointment
            LEFT JOIN FETCH t.doctor
            WHERE t.id = :id
            """)
    Optional<TimeSlot> findByIdWithAppointmentAndDoctor(@Param("id") Integer id);

    /**
     * Créneaux d'un médecin pour une plage donnée, avec patient et appointment chargés.
     */
    @Query("""
            SELECT t FROM TimeSlot t
            LEFT JOIN FETCH t.appointment a
            LEFT JOIN FETCH a.patient
            WHERE t.doctorId = :doctorId
              AND t.startTime >= :start
              AND t.startTime < :end
            ORDER BY t.startTime ASC
            """)
    List<TimeSlot> findWeekSlotsByDoctor(
            @Param("doctorId") Integer doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Créneaux hospitaliers (DoctorId NULL) d'un service pour une plage donnée.
     */
    @Query("""
            SELECT t FROM TimeSlot t
            LEFT JOIN FETCH t.service
            WHERE t.doctorId IS NULL
              AND t.serviceId = :serviceId
              AND t.startTime >= :start
              AND t.startTime < :end
            ORDER BY t.startTime ASC
            """)
    List<TimeSlot> findHospitalWeekSlots(
            @Param("serviceId") Integer serviceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Vérifie s'il existe au moins un créneau Available pour un médecin et une semaine.
     */
    @Query("""
            SELECT COUNT(t) > 0 FROM TimeSlot t
            WHERE t.doctorId = :doctorId
              AND t.startTime >= :start
              AND t.startTime < :end
              AND t.status = :status
            """)
    boolean hasAvailableSlot(
            @Param("doctorId") Integer doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") SlotStatus status);

    /**
     * Idem mais pour créneaux hospitaliers (DoctorId NULL).
     */
    @Query("""
            SELECT COUNT(t) > 0 FROM TimeSlot t
            WHERE t.doctorId IS NULL
              AND t.serviceId = :serviceId
              AND t.startTime >= :start
              AND t.startTime < :end
              AND t.status = :status
            """)
    boolean hasAvailableHospitalSlot(
            @Param("serviceId") Integer serviceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") SlotStatus status);

    /**
     * Détecte les chevauchements (overlap) sur les créneaux d'un médecin.
     */
    @Query("""
            SELECT COUNT(t) > 0 FROM TimeSlot t
            WHERE t.doctorId = :doctorId
              AND t.status <> com.hospital.appointment.entity.SlotStatus.Cancelled
              AND t.startTime < :end
              AND t.endTime > :start
            """)
    boolean existsOverlap(
            @Param("doctorId") Integer doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    Optional<TimeSlot> findByIdAndDoctorId(Integer id, Integer doctorId);

    /**
     * Créneaux disponibles d'un médecin pour une plage de dates (utilisé par InternalBridge).
     */
    @Query("""
            SELECT t FROM TimeSlot t
            WHERE t.doctorId = :doctorId
              AND t.startTime >= :start
              AND t.startTime < :end
              AND t.status = com.hospital.appointment.entity.SlotStatus.Available
            ORDER BY t.startTime ASC
            """)
    List<TimeSlot> findAvailableByDoctorAndDateRange(
            @Param("doctorId") Integer doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
