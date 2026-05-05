package com.hospital.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hospital.auth.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private Long patientId;
    private Long personnelId;
    private Long medecinAssigneId;

    @Column(name = "service_id")
    private String serviceId;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String cin;

    @Builder.Default
    private boolean enabled = true;

    @JsonIgnore private String resetToken;
    @JsonIgnore private LocalDateTime resetTokenExpiry;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean emailVerified = false;

    @JsonIgnore private String emailVerificationToken;
    @JsonIgnore private String refreshToken;
    @JsonIgnore private LocalDateTime refreshTokenExpiry;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private int failedLoginAttempts = 0;

    private LocalDateTime accountLockedUntil;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean isAccountLocked() {
        return accountLockedUntil != null && accountLockedUntil.isAfter(LocalDateTime.now());
    }
    public void incrementFailedAttempts() { this.failedLoginAttempts++; }
    public void resetFailedAttempts() {
        this.failedLoginAttempts = 0;
        this.accountLockedUntil = null;
    }
    public void lockAccount(int lockMinutes) {
        this.accountLockedUntil = LocalDateTime.now().plusMinutes(lockMinutes);
    }
}
