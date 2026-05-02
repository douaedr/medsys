package com.hospital.auth.service;

import com.hospital.auth.dto.*;
import com.hospital.auth.entity.UserAccount;
import com.hospital.auth.enums.Role;
import com.hospital.auth.exception.AuthException;
import com.hospital.auth.repository.UserAccountRepository;
import com.hospital.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${ms-patient.url:http://localhost:8081}")
    private String msPatientUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthResponse login(LoginRequest request, String ip) {
        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Identifiants invalides"));

        if (user.isAccountLocked()) {
            throw new AuthException("Compte bloqué temporairement. Réessayez plus tard.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            user.incrementFailedAttempts();
            if (user.getFailedLoginAttempts() >= 5) {
                user.lockAccount(15);
            }
            userAccountRepository.save(user);
            throw new AuthException("Identifiants invalides");
        }

        user.resetFailedAttempts();
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userAccountRepository.save(user);

        return buildAuthResponse(user, refreshToken);
    }

    public AuthResponse registerPatient(RegisterPatientRequest request) {
        if (userAccountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AuthException("Un compte existe déjà avec cet email.");
        }

        String verificationToken = UUID.randomUUID().toString();

        UserAccount user = UserAccount.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .cin(request.getCin())
                .role(Role.PATIENT)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .enabled(true)
                .build();

        userAccountRepository.save(user);

        // ── Synchronisation : créer le Patient dans ms-patient-personnel ──────
        try {
            Long patientId = createPatientInMsPatient(request);
            if (patientId != null) {
                user.setPatientId(patientId);
                userAccountRepository.save(user);
                log.info("Patient créé dans ms-patient-personnel avec id={} pour user={}", patientId, user.getEmail());
            }
        } catch (Exception e) {
            log.warn("Impossible de créer le patient dans ms-patient-personnel (sera retentée au login): {}", e.getMessage());
        }

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getNom() + " " + user.getPrenom(), verificationToken);
        } catch (Exception e) {
            log.warn("Email vérification non envoyé: {}", e.getMessage());
        }

        return buildAuthResponse(user, null);
    }

    /**
     * Appelle POST /api/v1/patients sur ms-patient-personnel pour créer le Patient + DossierMedical.
     * Renvoie le patientId créé.
     */
    private Long createPatientInMsPatient(RegisterPatientRequest request) {
        String url = msPatientUrl + "/api/v1/patients";

        Map<String, Object> body = new HashMap<>();
        body.put("nom", request.getNom());
        body.put("prenom", request.getPrenom());
        body.put("cin", request.getCin());
        body.put("dateNaissance", request.getDateNaissance() != null ? request.getDateNaissance().toString() : null);
        body.put("sexe", request.getSexe());
        body.put("telephone", request.getTelephone());
        body.put("email", request.getEmail());
        body.put("adresse", request.getAdresse());
        body.put("ville", request.getVille());
        body.put("groupeSanguin", request.getGroupeSanguin());
        body.put("mutuelle", request.getMutuelle());
        body.put("numeroCNSS", request.getNumeroCNSS());

        // Antécédents
        if (request.getAntecedents() != null && !request.getAntecedents().isEmpty()) {
            body.put("antecedents", request.getAntecedents().stream().map(a -> {
                Map<String, Object> m = new HashMap<>();
                m.put("type", a.getType());
                m.put("description", a.getDescription());
                m.put("dateApparition", a.getDateApparition() != null ? a.getDateApparition().toString() : null);
                m.put("actif", a.getActif());
                return m;
            }).toList());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Object idObj = response.getBody().get("id");
            if (idObj instanceof Number) {
                return ((Number) idObj).longValue();
            }
        }
        return null;
    }

    /**
     * Tente de synchroniser le patientId si manquant (appelé au login).
     */
    private void syncPatientIdIfMissing(UserAccount user) {
        if (user.getRole() != Role.PATIENT || user.getPatientId() != null) return;

        try {
            String url = msPatientUrl + "/api/v1/patients/cin/" + user.getCin();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object idObj = response.getBody().get("id");
                if (idObj instanceof Number) {
                    user.setPatientId(((Number) idObj).longValue());
                    userAccountRepository.save(user);
                    log.info("PatientId synchronisé pour {}: {}", user.getEmail(), user.getPatientId());
                }
            }
        } catch (Exception e) {
            log.debug("Sync patientId échouée pour {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public AuthResponse createPersonnelAccount(CreatePersonnelRequest request) {
        if (userAccountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AuthException("Un compte existe déjà avec cet email.");
        }

        UserAccount user = UserAccount.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .role(request.getRole())
                .emailVerified(true)
                .enabled(true)
                .build();

        userAccountRepository.save(user);
        return buildAuthResponse(user, null);
    }

    public AuthResponse refreshToken(String refreshToken) {
        UserAccount user = userAccountRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new AuthException("Token de rafraîchissement invalide"));

        if (user.getRefreshTokenExpiry() == null || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("Token de rafraîchissement expiré");
        }

        // Synchroniser le patientId si manquant
        syncPatientIdIfMissing(user);

        String newRefreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userAccountRepository.save(user);

        return buildAuthResponse(user, newRefreshToken);
    }

    public void verifyEmail(String token) {
        UserAccount user = userAccountRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new AuthException("Token de vérification invalide"));
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userAccountRepository.save(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userAccountRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userAccountRepository.save(user);
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getNom() + " " + user.getPrenom(), token);
            } catch (Exception e) {
                log.warn("Email reset non envoyé: {}", e.getMessage());
            }
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        UserAccount user = userAccountRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new AuthException("Token invalide ou expiré"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("Token expiré");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userAccountRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AuthException("Mot de passe actuel incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userAccountRepository.save(user);
    }

    public void changeEmail(String email, ChangeEmailRequest request) {
        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        if (userAccountRepository.findByEmail(request.getNewEmail()).isPresent()) {
            throw new AuthException("Cet email est déjà utilisé");
        }

        user.setEmail(request.getNewEmail());
        user.setEmailVerified(false);
        userAccountRepository.save(user);
    }

    public Map<String, Object> verifyToken(String token) {
        if (!jwtService.isTokenValid(token)) {
            throw new AuthException("Token invalide ou expiré");
        }
        return Map.of(
                "valid", true,
                "email", jwtService.extractEmail(token),
                "role", jwtService.extractRole(token),
                "userId", jwtService.extractUserId(token)
        );
    }

    private AuthResponse buildAuthResponse(UserAccount user, String refreshToken) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .refreshToken(refreshToken)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .patientId(user.getPatientId())
                .personnelId(user.getPersonnelId())
                .emailVerified(user.isEmailVerified())
                .build();
    }
}
