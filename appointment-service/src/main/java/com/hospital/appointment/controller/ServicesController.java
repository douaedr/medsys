package com.hospital.appointment.controller;

import com.hospital.appointment.dto.service.AssignServicesDto;
import com.hospital.appointment.entity.DoctorService;
import com.hospital.appointment.entity.MedicalService;
import com.hospital.appointment.entity.User;
import com.hospital.appointment.entity.UserRole;
import com.hospital.appointment.exception.BusinessException;
import com.hospital.appointment.exception.NotFoundException;
import com.hospital.appointment.repository.DoctorServiceRepository;
import com.hospital.appointment.repository.MedicalServiceRepository;
import com.hospital.appointment.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Migré depuis Controllers/ServicesController.cs (.NET).
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServicesController {

    private final MedicalServiceRepository serviceRepository;
    private final DoctorServiceRepository doctorServiceRepository;
    private final UserRepository userRepository;

    // GET /api/services — public
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(serviceRepository.findAllByOrderByNameAsc().stream()
                .<Map<String, Object>>map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("name", s.getName());
                    m.put("description", s.getDescription());
                    m.put("icon", s.getIcon());
                    return m;
                }).toList());
    }

    // GET /api/services/{id}/doctors — public
    @GetMapping("/{id}/doctors")
    public ResponseEntity<List<Map<String, Object>>> doctorsByService(@PathVariable Integer id) {
        if (!serviceRepository.existsById(id)) {
            throw new NotFoundException("Service introuvable.");
        }
        var list = doctorServiceRepository.findByServiceIdWithDoctor(id).stream()
                .map(DoctorService::getDoctor)
                .filter(d -> d != null && d.getRole() == UserRole.Doctor)
                .<Map<String, Object>>map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", d.getId());
                    m.put("fullName", d.getFullName());
                    m.put("email", d.getEmail());
                    m.put("phone", d.getPhone());
                    return m;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    // POST /api/services — Secretary
    @PostMapping
    @PreAuthorize("hasRole('Secretary')")
    public ResponseEntity<MedicalService> create(@RequestBody MedicalService service) {
        if (service.getName() == null || service.getName().isBlank()) {
            throw new BusinessException("Le nom du service est requis.");
        }
        if (serviceRepository.findByName(service.getName()).isPresent()) {
            throw new BusinessException("Ce service existe déjà.");
        }
        return ResponseEntity.ok(serviceRepository.save(service));
    }

    // POST /api/services/assign — Secretary
    @PostMapping("/assign")
    @PreAuthorize("hasRole('Secretary')")
    @Transactional
    public ResponseEntity<Void> assign(@Valid @RequestBody AssignServicesDto dto) {
        User doctor = userRepository.findById(dto.doctorId())
                .orElseThrow(() -> new NotFoundException("Médecin introuvable."));
        if (doctor.getRole() != UserRole.Doctor) {
            throw new BusinessException("L'utilisateur cible n'est pas un médecin.");
        }

        // Reset puis ré-assignation
        doctorServiceRepository.deleteAllByDoctorId(dto.doctorId());

        for (Integer serviceId : dto.serviceIds()) {
            if (!serviceRepository.existsById(serviceId)) continue;
            doctorServiceRepository.save(DoctorService.builder()
                    .doctorId(dto.doctorId())
                    .serviceId(serviceId)
                    .build());
        }
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/services/{id} — Secretary
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Secretary')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!serviceRepository.existsById(id)) {
            throw new NotFoundException("Service introuvable.");
        }
        serviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
