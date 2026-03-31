package com.hospital.patient.repository;

import com.hospital.patient.entity.FavoriteDoctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteDoctorRepository extends JpaRepository<FavoriteDoctor, Long> {
    List<FavoriteDoctor> findByPatientId(Long patientId);
    Optional<FavoriteDoctor> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
    boolean existsByPatientIdAndDoctorId(Long patientId, Long doctorId);
    void deleteByPatientIdAndDoctorId(Long patientId, Long doctorId);
}
