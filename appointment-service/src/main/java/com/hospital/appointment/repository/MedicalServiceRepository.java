package com.hospital.appointment.repository;

import com.hospital.appointment.entity.MedicalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalServiceRepository extends JpaRepository<MedicalService, Integer> {

    Optional<MedicalService> findByName(String name);

    List<MedicalService> findAllByOrderByNameAsc();
}
