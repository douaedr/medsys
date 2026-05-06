package com.hospital.patient.repository;

import com.hospital.patient.entity.TacheSoin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TacheSoinRepository extends JpaRepository<TacheSoin, Long> {
    List<TacheSoin> findByInfirmierId(Long infirmierId);
    List<TacheSoin> findByMedecinId(Long medecinId);
    List<TacheSoin> findByInfirmierIdAndStatut(Long infirmierId, String statut);
}
