package com.hospital.patient.repository;

import com.hospital.patient.entity.CreneauMedecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreneauMedecinRepository extends JpaRepository<CreneauMedecin, Long> {

    List<CreneauMedecin> findByMedecinIdAndActifTrueOrderByJourAscHeureDebutAsc(Long medecinId);

    List<CreneauMedecin> findByMedecinIdOrderByJourAscHeureDebutAsc(Long medecinId);

    List<CreneauMedecin> findByServiceIdAndActifTrueOrderByJourAscHeureDebutAsc(Long serviceId);

    List<CreneauMedecin> findByServiceIdOrderByJourAscHeureDebutAsc(Long serviceId);

    long countByMedecinIdAndActifTrue(Long medecinId);
}
