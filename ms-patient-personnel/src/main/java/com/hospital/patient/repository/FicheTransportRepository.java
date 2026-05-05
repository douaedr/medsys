package com.hospital.patient.repository;

import com.hospital.patient.model.FicheTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FicheTransportRepository extends JpaRepository<FicheTransport, Long> {
    List<FicheTransport> findByInfirmierId(Long infirmierId);
    List<FicheTransport> findByBrancardlerId(Long brancardlerId);
    List<FicheTransport> findByStatut(FicheTransport.Statut statut);
    List<FicheTransport> findByStatutOrderByUrgenceDescCreatedAtAsc(FicheTransport.Statut statut);
}
