package com.hospital.patient.repository;

import com.hospital.patient.model.EmploiDuTemps;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmploiDuTempsRepository extends JpaRepository<EmploiDuTemps, Long> {

    /** Tous les crÃ©neaux d'un personnel (vue "Mon emploi du temps") */
    List<EmploiDuTemps> findByPersonnelId(Long personnelId);

    /** Tous les crÃ©neaux crÃ©Ã©s par un chef de service */
    List<EmploiDuTemps> findByChefServiceId(Long chefServiceId);

    /** Tous les crÃ©neaux d'un service entier */
    List<EmploiDuTemps> findByServiceId(String serviceId);

    /** CrÃ©neaux d'un personnel pour un jour donnÃ© */
    List<EmploiDuTemps> findByPersonnelIdAndJourSemaine(Long personnelId, String jourSemaine);
}
