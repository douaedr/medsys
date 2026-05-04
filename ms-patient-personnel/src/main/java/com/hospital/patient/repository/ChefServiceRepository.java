package com.hospital.patient.repository;

import com.hospital.patient.model.ChefService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChefServiceRepository extends JpaRepository<ChefService, Long> {

    /** VÃ©rifie si un service a dÃ©jÃ  un chef (rÃ¨gle 1 chef/service) */
    Optional<ChefService> findByServiceId(String serviceId);

    /** Retrouver le service dont ce personnel est chef */
    Optional<ChefService> findByPersonnelId(Long personnelId);
}
