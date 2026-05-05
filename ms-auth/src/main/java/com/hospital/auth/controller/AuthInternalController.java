package com.hospital.auth.controller;

import com.hospital.auth.entity.UserAccount;
import com.hospital.auth.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class AuthInternalController {

    private final UserAccountRepository userAccountRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> result = userAccountRepository.findAll().stream()
                .map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Map<String, Object>>> getByRole(@PathVariable String role) {
        List<Map<String, Object>> result = userAccountRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase(role))
                .map(this::toMap).toList();
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

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<Map<String, Object>>> getByService(@PathVariable String serviceId) {
        List<Map<String, Object>> result = userAccountRepository.findAll().stream()
                .filter(u -> serviceId.equals(u.getServiceId()))
                .map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/service/{serviceId}/role/{role}")
    public ResponseEntity<List<Map<String, Object>>> getByServiceAndRole(
            @PathVariable String serviceId, @PathVariable String role) {
        List<Map<String, Object>> result = userAccountRepository.findAll().stream()
                .filter(u -> serviceId.equals(u.getServiceId())
                        && u.getRole() != null && u.getRole().name().equalsIgnoreCase(role))
                .map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/service")
    public ResponseEntity<?> assignerService(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return userAccountRepository.findById(id).map(user -> {
            user.setServiceId(body.get("serviceId"));
            userAccountRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "message", "Service assigne avec succes",
                "userId", id,
                "serviceId", body.get("serviceId")
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/service")
    public ResponseEntity<?> retirerService(@PathVariable Long id) {
        return userAccountRepository.findById(id).map(user -> {
            user.setServiceId(null);
            userAccountRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Personnel retire du service"));
        }).orElse(ResponseEntity.notFound().build());
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
        m.put("serviceId", u.getServiceId());
        m.put("enabled", u.isEnabled());
        return m;
    }
}
