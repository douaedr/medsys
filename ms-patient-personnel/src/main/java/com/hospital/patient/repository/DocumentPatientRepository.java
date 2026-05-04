package com.hospital.patient.repository;

import com.hospital.patient.entity.DocumentPatient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentPatientRepository extends JpaRepository<DocumentPatient, Long> {
    List<DocumentPatient> findByDossierMedicalIdOrderByDateUploadDesc(Long dossierMedicalId);
    Optional<DocumentPatient> findByIdAndDossierMedicalPatientId(Long id, Long patientId);
}