package com.hospital.appointment.controller;

import com.hospital.appointment.dto.appointment.AppointmentResponseDto;
import com.hospital.appointment.entity.*;
import com.hospital.appointment.exception.BusinessException;
import com.hospital.appointment.exception.NotFoundException;
import com.hospital.appointment.repository.*;
import com.hospital.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Endpoints internes (service-to-service) appelés par ms-patient-personnel.
 * Pas de JWT requis (/api/internal/** est permitAll dans SecurityConfig).
 */
@Slf4j
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalBridgeController {

    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    /**
     * GET /api/internal/patient/{email}/appointments
     * Récupère tous les RDV d'un patient par email.
     * Utilisé par chatbot-service et ms-patient-personnel.
     */
    @GetMapping("/patient/{email}/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getAppointmentsByPatientEmail(
            @PathVariable String email) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientEmail(email));
    }

    /**
     * GET /api/internal/rdv/patient/{email}
     * Alias utilisé par RdvProxyService dans ms-patient-personnel.
     */
    @GetMapping("/rdv/patient/{email}")
    public ResponseEntity<List<Map<String, Object>>> getRdvByEmail(@PathVariable String email) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByPatientEmail(email);

        List<Map<String, Object>> result = appointments.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.id());
            m.put("date", a.startTime() != null ? a.startTime().toLocalDate().toString() : null);
            m.put("heure", a.startTime() != null ? a.startTime().toLocalTime().toString().substring(0, 5) : null);
            m.put("motif", a.reason());
            m.put("statut", mapStatus(a.status()));
            m.put("medecinNom", a.doctorName());
            m.put("medecinSpecialite", null);
            m.put("notes", a.reason());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/internal/rdv/patient/creer
     * Crée un RDV depuis ms-patient-personnel (appelé par RdvProxyService).
     */
    @PostMapping("/rdv/patient/creer")
    public ResponseEntity<Map<String, Object>> creerRdv(@RequestBody Map<String, Object> body) {
        final String patientEmail = (String) body.get("patientEmail");
        final Object medecinIdObj = body.get("medecinId");
        final String dateHeureStr = (String) body.get("dateHeure");
        final String motif = (String) body.getOrDefault("motif", "");

        if (patientEmail == null || patientEmail.isBlank()) {
            throw new BusinessException("Email du patient requis.");
        }
        if (dateHeureStr == null) {
            throw new BusinessException("Date/heure requise.");
        }

        final Integer doctorId;
        if (medecinIdObj instanceof Number) {
            doctorId = ((Number) medecinIdObj).intValue();
        } else {
            doctorId = null;
        }

        LocalDateTime parsedDate;
        try {
            parsedDate = LocalDateTime.parse(dateHeureStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            try {
                parsedDate = LocalDateTime.parse(dateHeureStr);
            } catch (Exception e2) {
                throw new BusinessException("Format de date invalide. Attendu: yyyy-MM-ddTHH:mm:ss");
            }
        }
        final LocalDateTime dateHeure = parsedDate;
        if (dateHeure.isBefore(LocalDateTime.now())) {
            throw new BusinessException("Impossible de prendre un rendez-vous dans le passé.");
        }

        // Trouver ou créer le patient dans appointment-service
        User patient = userRepository.findByEmail(patientEmail)
                .orElseGet(() -> {
                    User u = User.builder()
                            .email(patientEmail)
                            .fullName(patientEmail.split("@")[0])
                            .role(UserRole.Patient)
                            .isRegistered(false)
                            .build();
                    return userRepository.save(u);
                });

        // Vérifier pénalité
        if (patient.getPenaltyUntil() != null && patient.getPenaltyUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Votre compte est bloqué jusqu'au " + patient.getPenaltyUntil().toLocalDate());
        }

        final LocalDateTime endTime = dateHeure.plusMinutes(30);

        // Chercher un créneau existant disponible
        TimeSlot slot = null;
        if (doctorId != null) {
            List<TimeSlot> slots = timeSlotRepository.findAll().stream()
                    .filter(s -> s.getStatus() == SlotStatus.Available)
                    .filter(s -> doctorId.equals(s.getDoctorId()))
                    .filter(s -> !s.getStartTime().isAfter(dateHeure) && !s.getEndTime().isBefore(endTime))
                    .findFirst()
                    .map(List::of)
                    .orElse(List.of());
            if (!slots.isEmpty()) slot = slots.get(0);
        }

        // Si aucun créneau, en créer un automatiquement
        if (slot == null) {
            slot = TimeSlot.builder()
                    .doctorId(doctorId)
                    .startTime(dateHeure)
                    .endTime(endTime)
                    .status(SlotStatus.Available)
                    .build();
            slot = timeSlotRepository.save(slot);
            log.info("Créneau auto-créé : {} -> {} pour docteur {}", dateHeure, endTime, doctorId);
        }

        // Réserver le créneau
        slot.setStatus(SlotStatus.Reserved);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        // Créer le RDV
        Appointment appt = Appointment.builder()
                .timeSlotId(slot.getId())
                .patientId(patient.getId())
                .bookedById(patient.getId())
                .reason(motif)
                .build();
        appointmentRepository.save(appt);

        log.info("RDV créé via bridge interne : patient={}, docteur={}, date={}", patientEmail, doctorId, dateHeure);

        // Réponse simplifiée
        String doctorName = null;
        if (slot.getDoctor() != null) {
            doctorName = slot.getDoctor().getFullName();
        } else if (doctorId != null) {
            doctorName = userRepository.findById(doctorId)
                    .map(User::getFullName)
                    .orElse("Médecin #" + doctorId);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", appt.getId());
        result.put("date", dateHeure.toLocalDate().toString());
        result.put("heure", dateHeure.toLocalTime().toString().substring(0, 5));
        result.put("motif", motif);
        result.put("statut", "EN_ATTENTE");
        result.put("medecinNom", doctorName);
        result.put("medecinSpecialite", null);
        result.put("notes", motif);

        return ResponseEntity.ok(result);
    }

    /**
     * PUT /api/internal/rdv/{rdvId}/annuler
     * Annule un RDV depuis ms-patient-personnel.
     */
    @PutMapping("/rdv/{rdvId}/annuler")
    public ResponseEntity<Map<String, String>> annulerRdv(
            @PathVariable Integer rdvId,
            @RequestParam(value = "email", required = false) String email) {

        Appointment appt = appointmentRepository.findById(rdvId)
                .orElseThrow(() -> new NotFoundException("Rendez-vous introuvable"));

        if (appt.getStatus() == AppointmentStatus.CancelledByPatient
                || appt.getStatus() == AppointmentStatus.CancelledByDoctor) {
            throw new BusinessException("Ce rendez-vous est déjà annulé.");
        }

        appt.setStatus(AppointmentStatus.CancelledByPatient);
        appt.setCancelledAt(LocalDateTime.now());
        appt.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appt);

        // Libérer le créneau
        timeSlotRepository.findById(appt.getTimeSlotId()).ifPresent(slot -> {
            slot.setStatus(SlotStatus.Available);
            slot.setUpdatedAt(LocalDateTime.now());
            timeSlotRepository.save(slot);
        });

        // Incrémenter pénalité
        if (appt.getPatient() != null) {
            User patient = appt.getPatient();
            patient.setCancelCount(patient.getCancelCount() == null ? 1 : patient.getCancelCount() + 1);
            if (patient.getCancelCount() >= 3) {
                patient.setPenaltyUntil(LocalDateTime.now().plusDays(7));
                patient.setCancelCount(0);
            }
            userRepository.save(patient);
        }

        log.info("RDV {} annulé via bridge interne", rdvId);
        return ResponseEntity.ok(Map.of("message", "Rendez-vous annulé avec succès"));
    }

    // ── Helper ──────────────────────────────────────────────────
    private String mapStatus(String status) {
        if (status == null) return "EN_ATTENTE";
        return switch (status) {
            case "Confirmed" -> "CONFIRME";
            case "CancelledByPatient", "CancelledByDoctor", "CancelledBySecretary" -> "ANNULE";
            case "Completed" -> "TERMINE";
            case "NoShow" -> "NON_PRESENTE";
            default -> "EN_ATTENTE";
        };
    }
}