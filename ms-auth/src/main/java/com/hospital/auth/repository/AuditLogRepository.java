package com.hospital.auth.repository;

import com.hospital.auth.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEmailOrderByCreatedAtDesc(String email);
    List<AuditLog> findByEventTypeOrderByCreatedAtDesc(String eventType);
}
