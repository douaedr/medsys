package com.hospital.auth.controller;

import com.hospital.auth.entity.UserAccount;
import com.hospital.auth.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Endpoints internes consommés par ms-patient-personnel (FEAT 2, 5, 7).
 * Ces endpoints sont protégés au niveau réseau (permitAll en config Spring,
 * mais doivent rester sur le réseau interne du cluster en prod).
 *
 * URL : /api/internal/** — déjà permitAll dans la SecurityConfig de ms-auth.
 */
@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class AuthInternalController {

    private final UserAccountRepository userAccountRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> result = userAccountRepository.findAll().stream()
                .map(this::toMap)
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Map<String, Object>>> getByRole(@PathVariable String role) {
        List<Map<String, Object>> result = userAccountRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase(role))
                .map(this::toMap)
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/personnel/{personnelId}")
    public ResponseEntity<Map<String, Object>> getByPersonnelId(@PathVariable Long personnelId) {
        return userAccountRepository.findAll().stream()
                .filter(u -> personnelId.equals(u.getPersonnelId()))
                .findFirst()
                .map(u -> ResponseEntity.ok(toMap(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long userId) {
        return userAccountRepository.findById(userId)
                .map(u -> ResponseEntity.ok(toMap(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(UserAccount u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("nom", u.getNom());
        m.put("prenom", u.getPrenom());
        m.put("role", u.getRole() != null ? u.getRole().name() : null);
        m.put("patientId", u.getPatientId());
        m.put("personnelId", u.getPersonnelId());
        m.put("enabled", u.isEnabled());
        return m;
    }
}
