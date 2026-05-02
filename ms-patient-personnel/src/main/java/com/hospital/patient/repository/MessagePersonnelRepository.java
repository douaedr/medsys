package com.hospital.patient.repository;

import com.hospital.patient.entity.MessagePersonnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessagePersonnelRepository extends JpaRepository<MessagePersonnel, Long> {

    List<MessagePersonnel> findByDestinataireIdOrderByDateEnvoiDesc(Long destinataireId);

    List<MessagePersonnel> findByExpediteurIdOrderByDateEnvoiDesc(Long expediteurId);

    long countByDestinataireIdAndLuFalse(Long destinataireId);

    List<MessagePersonnel> findByDestinataireIdAndPrioriteAndLuFalseOrderByDateEnvoiDesc(
            Long destinataireId, MessagePersonnel.Priorite priorite);
}
