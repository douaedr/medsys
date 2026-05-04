package com.hospital.appointment.service;

import com.hospital.appointment.dto.appointment.AppointmentResponseDto;
import com.hospital.appointment.dto.appointment.BookAppointmentDto;
import com.hospital.appointment.dto.appointment.CancelAppointmentDto;
import com.hospital.appointment.dto.appointment.UpdateAppointmentDto;
import com.hospital.appointment.entity.*;
import com.hospital.appointment.exception.BusinessException;
import com.hospital.appointment.exception.NotFoundException;
import com.hospital.appointment.exception.UnauthorizedException;
import com.hospital.appointment.repository.*;
import com.hospital.appointment.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final WaitingListEntryRepository waitingListEntryRepository;
    private final NotificationService notificationService;

    public AppointmentResponseDto book(BookAppointmentDto dto) {

        // Verrou pessimiste — empêche le double booking simultané
        TimeSlot slot = timeSlotRepository.findByIdWithLock(dto.timeSlotId())
                .orElseThrow(() -> new NotFoundException("Créneau introuvable"));

        if (slot.getStatus() != SlotStatus.Available) {
            throw new BusinessException("Ce créneau n'est plus disponible.");
        }
        if (slot.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Ce créneau est dans le passé.");
        }

        User current = SecurityUtils.getCurrentUser();
        User patient;
        Integer bookedById;
        String anonymousToken = null;

        if (current != null) {
            bookedById = current.getId();

            if (current.getRole() == UserRole.Patient) {
                // Patient connecté — réserve pour lui-même
                patient = current;

            } else {
                // Doctor ou Secretary — réserve pour un patient tiers
                if (dto.patientEmail() == null || dto.patientName() == null) {
                    throw new BusinessException("Email et nom du patient sont requis.");
                }

                // Secrétaire : vérifier qu'elle est assignée au médecin du créneau
                if (current.getRole() == UserRole.Secretary) {
                    if (slot.getDoctorId() != null
                            && !slot.getDoctorId().equals(current.getAssignedDoctorId())) {
                        throw new UnauthorizedException(
                                "Vous n'êtes pas assignée au médecin de ce créneau.");
                    }
                }

                patient = findOrCreateAnonymousPatient(
                        dto.patientName(), dto.patientEmail(), dto.patientPhone());
            }

        } else {
            // Utilisateur anonyme
            anonymousToken = UUID.randomUUID().toString();
            if (dto.patientEmail() == null || dto.patientName() == null) {
                throw new BusinessException("Email et nom sont requis pour réserver sans compte.");
            }
            patient = findOrCreateAnonymousPatient(
                    dto.patientName(), dto.patientEmail(), dto.patientPhone());
            bookedById = patient.getId();
        }

        checkPenalty(patient);

        slot.setStatus(SlotStatus.Reserved);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        Appointment appt = Appointment.builder()
                .timeSlotId(slot.getId())
                .patientId(patient.getId())
                .bookedById(bookedById)
                .reason(dto.reason())
                .anonymousToken(anonymousToken)
                .build();
        appointmentRepository.save(appt);

        auditLogRepository.save(AuditLog.builder()
                .action("BOOK")
                .userId(bookedById)
                .entityType("Appointment")
                .entityId(appt.getId() != null ? appt.getId() : 0)
                .detail("Patient %d, créneau %d".formatted(patient.getId(), slot.getId()))
                .build());

        try {
            notificationService.sendBookingConfirmation(patient, appt, slot);
        } catch (Exception ex) {
            log.warn("Email confirmation non envoyé : {}", ex.getMessage());
        }

        return toDto(appt, slot, patient, anonymousToken);
    }

    public void cancel(CancelAppointmentDto dto) {
        Appointment appt = appointmentRepository.findById(dto.appointmentId())
                .orElseThrow(() -> new NotFoundException("Rendez-vous introuvable"));

        if (appt.getStatus() == AppointmentStatus.CancelledByPatient
                || appt.getStatus() == AppointmentStatus.CancelledByDoctor
                || appt.getStatus() == AppointmentStatus.CancelledBySecretary) {
            throw new BusinessException("Ce rendez-vous est déjà annulé.");
        }
        if (appt.getStatus() == AppointmentStatus.Completed) {
            throw new BusinessException("Impossible d'annuler un rendez-vous terminé.");
        }

        TimeSlot slot = timeSlotRepository.findById(appt.getTimeSlotId())
                .orElseThrow(() -> new NotFoundException("Créneau introuvable"));

        User current = SecurityUtils.getCurrentUser();
        AppointmentStatus cancelStatus = AppointmentStatus.CancelledByPatient;

        if (current != null) {
            if (current.getRole() == UserRole.Patient
                    && !current.getId().equals(appt.getPatientId())) {
                throw new UnauthorizedException("Vous ne pouvez pas annuler ce rendez-vous.");
            }
            if (current.getRole() == UserRole.Doctor) {
                cancelStatus = AppointmentStatus.CancelledByDoctor;
            } else if (current.getRole() == UserRole.Secretary) {
                cancelStatus = AppointmentStatus.CancelledBySecretary;
            }
        } else {
            if (dto.anonymousToken() == null
                    || !dto.anonymousToken().equals(appt.getAnonymousToken())) {
                throw new UnauthorizedException("Token invalide.");
            }
        }

        User patient = appt.getPatient();

        appt.setStatus(cancelStatus);
        appt.setCancelledAt(LocalDateTime.now());
        appt.setCancelReason(dto.cancelReason());
        appt.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appt);

        slot.setStatus(SlotStatus.Available);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        auditLogRepository.save(AuditLog.builder()
                .action("CANCEL")
                .userId(current != null ? current.getId() : appt.getPatientId())
                .entityType("Appointment")
                .entityId(appt.getId())
                .detail("Annulation RDV %d, créneau %d".formatted(appt.getId(), slot.getId()))
                .build());

        if (patient != null) {
            applyPenalty(patient);
            try {
                notificationService.sendCancellationConfirmation(patient, slot);
            } catch (Exception ex) {
                log.warn("Email annulation non envoyé : {}", ex.getMessage());
            }
        }

        notifyWaitingList(slot);
    }

    public AppointmentResponseDto reschedule(UpdateAppointmentDto dto) {
        Appointment appt = appointmentRepository.findById(dto.appointmentId())
                .orElseThrow(() -> new NotFoundException("Rendez-vous introuvable"));

        User current = SecurityUtils.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Non authentifié");

        if (current.getRole() == UserRole.Patient
                && !current.getId().equals(appt.getPatientId())) {
            throw new UnauthorizedException("Accès refusé.");
        }

        TimeSlot oldSlot = timeSlotRepository.findById(appt.getTimeSlotId())
                .orElseThrow(() -> new NotFoundException("Ancien créneau introuvable"));
        TimeSlot newSlot = timeSlotRepository.findByIdWithLock(dto.newTimeSlotId())
                .orElseThrow(() -> new NotFoundException("Nouveau créneau introuvable"));

        if (newSlot.getStatus() != SlotStatus.Available) {
            throw new BusinessException("Le nouveau créneau n'est pas disponible.");
        }

        oldSlot.setStatus(SlotStatus.Available);
        oldSlot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(oldSlot);

        newSlot.setStatus(SlotStatus.Reserved);
        newSlot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(newSlot);

        appt.setTimeSlotId(newSlot.getId());
        appt.setReason(dto.reason());
        appt.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appt);

        auditLogRepository.save(AuditLog.builder()
                .action("RESCHEDULE")
                .userId(current.getId())
                .entityType("Appointment")
                .entityId(appt.getId())
                .detail("RDV %d: créneau %d -> %d".formatted(
                        appt.getId(), oldSlot.getId(), newSlot.getId()))
                .build());

        return toDto(appt, newSlot, appt.getPatient(), null);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getMine() {
        User current = SecurityUtils.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Non authentifié");

        List<Appointment> appointments;
        switch (current.getRole()) {
            case Patient -> appointments =
                    appointmentRepository.findByPatientIdWithRelations(current.getId());
            case Doctor -> appointments = appointmentRepository.findAll().stream()
                    .filter(a -> a.getTimeSlot() != null
                            && a.getTimeSlot().getDoctorId() != null
                            && a.getTimeSlot().getDoctorId().equals(current.getId()))
                    .collect(Collectors.toList());
            default -> appointments = appointmentRepository.findAll();
        }

        return appointments.stream()
                .map(a -> toDto(a, a.getTimeSlot(), a.getPatient(), null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDto getById(Integer id) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rendez-vous introuvable"));
        return toDto(appt, appt.getTimeSlot(), appt.getPatient(), null);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointmentsByPatientEmail(String email) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getPatient() != null
                        && email.equalsIgnoreCase(a.getPatient().getEmail()))
                .map(a -> toDto(a, a.getTimeSlot(), a.getPatient(), null))
                .collect(Collectors.toList());
    }

    private User findOrCreateAnonymousPatient(String name, String email, String phone) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) return existing.get();
        User u = User.builder()
                .fullName(name)
                .email(email)
                .phone(phone)
                .role(UserRole.Patient)
                .isRegistered(false)
                .build();
        return userRepository.save(u);
    }

    private void checkPenalty(User patient) {
        if (patient.getPenaltyUntil() != null
                && patient.getPenaltyUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessException(
                    "Votre compte est bloqué jusqu'au " + patient.getPenaltyUntil());
        }
    }

    private void applyPenalty(User patient) {
        patient.setCancelCount(
                patient.getCancelCount() == null ? 1 : patient.getCancelCount() + 1);
        if (patient.getCancelCount() >= 3) {
            patient.setPenaltyUntil(LocalDateTime.now().plusDays(7));
            patient.setCancelCount(0);
            try {
                notificationService.sendPenaltyNotification(patient);
            } catch (Exception ex) {
                log.warn("Email pénalité non envoyé : {}", ex.getMessage());
            }
        }
        userRepository.save(patient);
    }

    private void notifyWaitingList(TimeSlot slot) {
        waitingListEntryRepository.findAll().stream()
                .filter(e -> e.getNotifiedAt() == null)
                .findFirst()
                .ifPresent(entry -> {
                    try {
                        notificationService.sendWaitingListNotification(
                                entry.getEmail(), entry.getPatientName(), slot);
                        entry.setNotifiedAt(LocalDateTime.now());
                        waitingListEntryRepository.save(entry);
                    } catch (Exception ex) {
                        log.warn("Email liste d'attente non envoyé à {} : {}",
                                entry.getEmail(), ex.getMessage());
                    }
                });
    }

    private AppointmentResponseDto toDto(Appointment a, TimeSlot s, User p, String tokenIfAny) {
        return new AppointmentResponseDto(
                a.getId(),
                s != null ? s.getId() : null,
                s != null ? s.getStartTime() : null,
                s != null ? s.getEndTime() : null,
                p != null ? p.getFullName() : null,
                p != null ? p.getEmail() : null,
                a.getStatus().name(),
                tokenIfAny,
                a.getCreatedAt(),
                s != null && s.getDoctor() != null ? s.getDoctor().getFullName() : null,
                a.getReason(),
                a.getCancelReason()
        );
    }

    @Transactional
    public AppointmentResponseDto createRdvSecretaire(com.hospital.appointment.dto.SecretaireRdvRequest req) {

        // Chercher le slot disponible pour ce medecin a cette date/heure
        TimeSlot slot = timeSlotRepository.findAll().stream()
                .filter(s -> s.getDoctorId() != null
                        && s.getDoctorId().equals(req.getMedecinId().intValue())
                        && s.getStartTime().equals(req.getDateHeure())
                        && s.getStatus() == SlotStatus.Available)
                .findFirst()
                .orElseThrow(() -> new com.hospital.appointment.exception.BusinessException(
                        "Aucun creneau disponible pour ce medecin a cette date/heure"));

        // Chercher ou creer le patient
        User patient = userRepository.findById(req.getPatientId().intValue())
                .orElseThrow(() -> new com.hospital.appointment.exception.NotFoundException(
                        "Patient introuvable"));

        slot.setStatus(SlotStatus.Reserved);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        Appointment appt = Appointment.builder()
                .timeSlotId(slot.getId())
                .patientId(patient.getId())
                .bookedById(patient.getId())
                .reason(req.getMotif())
                .build();
        appointmentRepository.save(appt);

        return toDto(appt, slot, patient, null);
    }
}