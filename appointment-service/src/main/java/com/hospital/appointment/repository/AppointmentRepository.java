package com.hospital.appointment.repository;

import com.hospital.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    @Query("""
            SELECT a FROM Appointment a
            LEFT JOIN FETCH a.timeSlot t
            LEFT JOIN FETCH t.doctor
            LEFT JOIN FETCH a.patient
            WHERE a.id = :id
            """)
    Optional<Appointment> findByIdWithRelations(@Param("id") Integer id);

    @Query("""
            SELECT a FROM Appointment a
            LEFT JOIN FETCH a.timeSlot t
            LEFT JOIN FETCH t.doctor
            LEFT JOIN FETCH a.patient
            WHERE a.patientId = :patientId
            ORDER BY t.startTime DESC
            """)
    List<Appointment> findByPatientIdWithRelations(@Param("patientId") Integer patientId);

    @Query("""
            SELECT a FROM Appointment a
            LEFT JOIN FETCH a.timeSlot t
            LEFT JOIN FETCH t.doctor
            LEFT JOIN FETCH a.patient
            ORDER BY t.startTime DESC
            """)
    List<Appointment> findAllWithRelations();

    @Query("""
            SELECT a FROM Appointment a
            LEFT JOIN FETCH a.timeSlot t
            LEFT JOIN FETCH t.doctor
            LEFT JOIN FETCH a.patient
            WHERE t.doctorId = :doctorId
            ORDER BY t.startTime DESC
            """)
    List<Appointment> findByDoctorIdWithRelations(@Param("doctorId") Integer doctorId);

    /**
     * Recherche un rendez-vous par son id et l'email du patient (utilisé par InternalBridge).
     */
    @Query("""
            SELECT a FROM Appointment a
            LEFT JOIN FETCH a.timeSlot
            LEFT JOIN FETCH a.patient p
            WHERE a.id = :id AND p.email = :email
            """)
    Optional<Appointment> findByIdAndPatientEmail(
            @Param("id") Integer id,
            @Param("email") String email);
}
