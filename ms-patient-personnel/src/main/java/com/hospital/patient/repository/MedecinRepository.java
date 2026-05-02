package com.hospital.patient.repository;

import com.hospital.patient.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {

    /**
     * FEAT 1 — Liste les médecins d'un service donné.
     * NB : Medecin.service est une relation @ManyToOne, donc Spring Data
     * traverse l'objet via "service.id" → findByService_Id.
     */
    List<Medecin> findByService_Id(Long serviceId);
}
