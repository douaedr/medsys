package com.hospital.appointment.repository;

import com.hospital.appointment.entity.DoctorService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DoctorServiceRepository
        extends JpaRepository<DoctorService, DoctorService.DoctorServiceId> {

    @Query("""
            SELECT ds FROM DoctorService ds
            LEFT JOIN FETCH ds.doctor
            WHERE ds.serviceId = :serviceId
            """)
    List<DoctorService> findByServiceIdWithDoctor(@Param("serviceId") Integer serviceId);

    @Query("""
            SELECT ds FROM DoctorService ds
            LEFT JOIN FETCH ds.service
            WHERE ds.doctorId = :doctorId
            """)
    List<DoctorService> findByDoctorIdWithService(@Param("doctorId") Integer doctorId);

    List<DoctorService> findByDoctorId(Integer doctorId);

    @Modifying
    @Transactional
    @Query("DELETE FROM DoctorService ds WHERE ds.doctorId = :doctorId")
    void deleteAllByDoctorId(@Param("doctorId") Integer doctorId);
}
