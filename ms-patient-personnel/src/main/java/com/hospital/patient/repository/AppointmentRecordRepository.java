package com.hospital.patient.repository;

import com.hospital.patient.entity.AppointmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRecordRepository extends JpaRepository<AppointmentRecord, Long> {
    List<AppointmentRecord> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<AppointmentRecord> findByPatientIdAndStatusOrderByAppointmentDateDesc(Long patientId, String status);
    List<AppointmentRecord> findByPatientIdAndAppointmentDateAfterOrderByAppointmentDateAsc(
            Long patientId, LocalDateTime from);
    List<AppointmentRecord> findByPatientIdAndAppointmentDateBeforeOrderByAppointmentDateDesc(
            Long patientId, LocalDateTime before);
    Optional<AppointmentRecord> findByExternalAppointmentId(Long externalId);
    long countByPatientIdAndStatus(Long patientId, String status);
}
