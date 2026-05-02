package com.hospital.patient.repository;

import com.hospital.patient.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    /** FEAT 1 — retrouve le service dont l'utilisateur est chef. */
    Optional<Service> findByChefId(Long chefId);
}
