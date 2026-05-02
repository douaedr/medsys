package com.hospital.appointment.repository;

import com.hospital.appointment.entity.WaitingListEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingListEntryRepository extends JpaRepository<WaitingListEntry, Integer> {

    List<WaitingListEntry> findByDoctorIdAndWeekStartDateOrderByCreatedAtAsc(
            Integer doctorId, LocalDate weekStartDate);

    List<WaitingListEntry> findByDoctorIdAndWeekStartDate(
            Integer doctorId, LocalDate weekStartDate);

    Optional<WaitingListEntry> findByIdAndEmail(Integer id, String email);
}
