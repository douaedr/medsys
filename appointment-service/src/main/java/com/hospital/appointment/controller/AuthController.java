package com.hospital.appointment.controller;

import com.hospital.appointment.dto.auth.AuthResponseDto;
import com.hospital.appointment.dto.auth.CreateStaffDto;
import com.hospital.appointment.dto.auth.LoginDto;
import com.hospital.appointment.dto.auth.RegisterDto;
import com.hospital.appointment.entity.User;
import com.hospital.appointment.entity.UserRole;
import com.hospital.appointment.exception.BusinessException;
import com.hospital.appointment.exception.UnauthorizedException;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Migré depuis Controllers/AuthController.cs (.NET).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterDto dto) {
        User existing = userRepository.findByEmail(dto.email()).orElse(null);

        User user;
        if (existing != null) {
            // Patient anonyme qui finalise son inscription
            if (Boolean.TRUE.equals(existing.getIsRegistered())) {
                throw new BusinessException("Un compte avec cet email existe déjà.");
            }
            existing.setFullName(dto.fullName());
            existing.setPhone(dto.phone());
            existing.setPasswordHash(passwordEncoder.encode(dto.password()));
            existing.setIsRegistered(true);
            user = userRepository.save(existing);
        } else {
            user = User.builder()
                    .fullName(dto.fullName())
                    .email(dto.email())
                    .phone(dto.phone())
                    .passwordHash(passwordEncoder.encode(dto.password()))
                    .role(UserRole.Patient)
                    .isRegistered(true)
                    .cancelCount(0)
                    .build();
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponseDto(
                token, user.getRole().name(), user.getFullName(), jwtService.getExpiresAt()));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginDto dto) {
        User user = userRepository.findByEmailAndIsRegistered(dto.email(), true)
                .orElseThrow(() -> new UnauthorizedException("Email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(dto.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email ou mot de passe incorrect.");
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponseDto(
                token, user.getRole().name(), user.getFullName(), jwtService.getExpiresAt()));
    }

    // POST /api/auth/staff (Secretary uniquement)
    @PostMapping("/staff")
    @PreAuthorize("hasRole('Secretary')")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffDto dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new BusinessException("Un compte avec cet email existe déjà.");
        }
        UserRole role;
        try {
            role = UserRole.valueOf(dto.role());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Rôle invalide. Doit être 'Doctor' ou 'Secretary'.");
        }
        if (role == UserRole.Patient) {
            throw new BusinessException("Utilisez /register pour créer un compte patient.");
        }

        User staff = User.builder()
                .fullName(dto.fullName())
                .email(dto.email())
                .phone(dto.phone())
                .passwordHash(passwordEncoder.encode(dto.password()))
                .role(role)
                .isRegistered(true)
                .cancelCount(0)
                .build();
        staff = userRepository.save(staff);

        return ResponseEntity.ok(java.util.Map.of(
                "id", staff.getId(),
                "fullName", staff.getFullName(),
                "email", staff.getEmail(),
                "role", staff.getRole().name()));
    }
}
