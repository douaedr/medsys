package com.hospital.appointment.repository;

import com.hospital.appointment.entity.User;
import com.hospital.appointment.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsRegistered(String email, Boolean isRegistered);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndRole(String email, UserRole role);
}
