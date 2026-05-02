package com.hospital.patient.service;

import com.hospital.patient.dto.*;
import com.hospital.patient.entity.AppointmentRecord;
import com.hospital.patient.entity.FavoriteDoctor;
import com.hospital.patient.exception.PatientNotFoundException;
import com.hospital.patient.mapper.PatientMapper;
import com.hospital.patient.messaging.NotificationPublisher;
import com.hospital.patient.repository.AppointmentRecordRepository;
import com.hospital.patient.repository.FavoriteDoctorRepository;
import com.hospital.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientDashboardService {

    private final PatientRepository patientRepo;
    private final AppointmentRecordRepository appointmentRepo;
    private final FavoriteDoctorRepository favoriteRepo;
    private final MessageService messageService;
    private final NotificationPublisher notificationPublisher;
    private final PatientMapper patientMapper;

    public PatientDashboardDTO getDashboard(Long patientId) {
        var patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient introuvable: " + patientId));

        LocalDateTime now = LocalDateTime.now();

        List<AppointmentRecordDTO> upcoming = appointmentRepo
                .findByPatientIdAndAppointmentDateAfterOrderByAppointmentDateAsc(patientId, now)
                .stream().map(this::toDTO).collect(Collectors.toList());

        List<AppointmentRecordDTO> past = appointmentRepo
                .findByPatientIdAndAppointmentDateBeforeOrderByAppointmentDateDesc(patientId, now)
                .stream().map(this::toDTO).collect(Collectors.toList());

        long totalAppointments = appointmentRepo.findByPatientIdOrderByAppointmentDateDesc(patientId).size();
        long completed  = appointmentRepo.countByPatientIdAndStatus(patientId, "COMPLETED");
        long cancelled  = appointmentRepo.countByPatientIdAndStatus(patientId, "CANCELLED");
        long favorites  = favoriteRepo.findByPatientId(patientId).size();
        long unread     = messageService.countUnreadFromMedecin(patientId);

        return PatientDashboardDTO.builder()
                .profile(patientMapper.toResponseDTO(patient))
                .upcomingAppointments(upcoming)
                .pastAppointments(past)
                .statistics(PatientDashboardDTO.DashboardStatsDTO.builder()
                        .totalAppointments(totalAppointments)
                        .upcomingCount(upcoming.size())
                        .completedCount(completed)
                        .cancelledCount(cancelled)
                        .favoriteDoctorsCount(favorites)
                        .unreadMessages(unread)
                        .build())
                .build();
    }

    public List<AppointmentRecordDTO> getAppointmentHistory(Long patientId) {
        if (!patientRepo.existsById(patientId)) {
            throw new PatientNotFoundException("Patient introuvable: " + patientId);
        }
        return appointmentRepo.findByPatientIdOrderByAppointmentDateDesc(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AppointmentRebookDTO rebookAppointment(Long patientId, Long appointmentId) {
        if (!patientRepo.existsById(patientId)) {
            throw new PatientNotFoundException("Patient introuvable: " + patientId);
        }

        AppointmentRecord original = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new PatientNotFoundException(
                        "Rendez-vous introuvable: " + appointmentId));

        if (!original.getPatientId().equals(patientId)) {
            throw new IllegalStateException("Ce rendez-vous n'appartient pas a ce patient.");
        }

        notificationPublisher.publishRebookRequest(
                patientId,
                original.getExternalAppointmentId(),
                original.getDoctorId(),
                original.getDoctorName(),
                original.getSpecialty(),
                original.getNotes()
        );

        log.info("[REBOOK] Patient {} requested rebook of appointment {}", patientId, appointmentId);

        return AppointmentRebookDTO.builder()
                .originalAppointmentId(original.getExternalAppointmentId())
                .doctorId(original.getDoctorId())
                .doctorName(original.getDoctorName())
                .specialty(original.getSpecialty())
                .notes(original.getNotes())
                .status("REBOOK_REQUESTED")
                .requestedAt(LocalDateTime.now())
                .message("Votre demande de re-reservation avec " + original.getDoctorName()
                        + " a ete transmise. Vous recevrez une confirmation sous peu.")
                .build();
    }

    public NextAvailableSlotDTO suggestNextSlot(Long patientId) {
        if (!patientRepo.existsById(patientId)) {
            throw new PatientNotFoundException("Patient introuvable: " + patientId);
        }

        LocalDateTime now = LocalDateTime.now();

        List<AppointmentRecord> completed = appointmentRepo
                .findByPatientIdAndStatusOrderByAppointmentDateDesc(patientId, "COMPLETED");

        if (completed.size() >= 2) {
            List<AppointmentRecord> sorted = completed.stream()
                    .sorted(Comparator.comparing(AppointmentRecord::getAppointmentDate))
                    .collect(Collectors.toList());

            long totalDays = 0;
            for (int i = 1; i < sorted.size(); i++) {
                totalDays += Duration.between(
                        sorted.get(i - 1).getAppointmentDate(),
                        sorted.get(i).getAppointmentDate()).toDays();
            }
            long avgInterval = totalDays / (sorted.size() - 1);

            AppointmentRecord latest = sorted.get(sorted.size() - 1);
            LocalDateTime suggestedDate = latest.getAppointmentDate().plusDays(avgInterval);

            if (suggestedDate.isBefore(now)) {
                suggestedDate = now.plusDays(avgInterval);
            }

            return NextAvailableSlotDTO.builder()
                    .suggestedDoctorId(latest.getDoctorId())
                    .suggestedDoctorName(latest.getDoctorName())
                    .specialty(latest.getSpecialty())
                    .suggestedDate(suggestedDate)
                    .suggestionBasis("LAST_APPOINTMENT_INTERVAL")
                    .message("Base sur votre historique, votre prochain rendez-vous avec "
                            + latest.getDoctorName() + " est suggere pour le "
                            + suggestedDate.toLocalDate() + ".")
                    .build();
        }

        List<Long> upcomingDoctorIds = appointmentRepo
                .findByPatientIdAndAppointmentDateAfterOrderByAppointmentDateAsc(patientId, now)
                .stream().map(AppointmentRecord::getDoctorId).collect(Collectors.toList());

        Optional<FavoriteDoctor> favWithoutUpcoming = favoriteRepo.findByPatientId(patientId)
                .stream()
                .filter(f -> !upcomingDoctorIds.contains(f.getDoctorId()))
                .findFirst();

        if (favWithoutUpcoming.isPresent()) {
            FavoriteDoctor fav = favWithoutUpcoming.get();
            LocalDateTime suggestedDate = now.plusDays(7);
            return NextAvailableSlotDTO.builder()
                    .suggestedDoctorId(fav.getDoctorId())
                    .suggestedDoctorName(fav.getDoctorName())
                    .specialty(fav.getSpecialty())
                    .suggestedDate(suggestedDate)
                    .suggestionBasis("FAVORITE_DOCTOR")
                    .message("Vous n'avez pas de rendez-vous prevu avec " + fav.getDoctorName()
                            + " (favori). Un creneau est suggere a partir du "
                            + suggestedDate.toLocalDate() + ".")
                    .build();
        }

        return NextAvailableSlotDTO.builder()
                .suggestedDate(now.plusDays(7))
                .suggestionBasis("NO_DATA")
                .message("Aucune donnee disponible pour generer une suggestion personnalisee. "
                        + "Consultez la liste des medecins disponibles.")
                .build();
    }

    private AppointmentRecordDTO toDTO(AppointmentRecord r) {
        return AppointmentRecordDTO.builder()
                .id(r.getId())
                .externalAppointmentId(r.getExternalAppointmentId())
                .doctorId(r.getDoctorId())
                .doctorName(r.getDoctorName())
                .specialty(r.getSpecialty())
                .appointmentDate(r.getAppointmentDate())
                .status(r.getStatus())
                .notes(r.getNotes())
                .recordedAt(r.getRecordedAt())
                .build();
    }
}