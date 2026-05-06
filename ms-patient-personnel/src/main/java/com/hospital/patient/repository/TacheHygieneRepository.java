package com.hospital.patient.repository;

import com.hospital.patient.entity.TacheHygiene;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TacheHygieneRepository extends JpaRepository<TacheHygiene, Long> {
    List<TacheHygiene> findByAideSoignantId(Long aideSoignantId);
    List<TacheHygiene> findByInfirmierId(Long infirmierId);
    List<TacheHygiene> findByAideSoignantIdAndStatut(Long aideSoignantId, String statut);
}
