package com.hospital.appointment.service;

import com.hospital.appointment.dto.slot.CreateBulkSlotsDto;
import com.hospital.appointment.dto.slot.CreateSlotDto;
import com.hospital.appointment.dto.slot.HospitalSlotResponseDto;
import com.hospital.appointment.dto.slot.TimeSlotResponseDto;
import com.hospital.appointment.entity.AuditLog;
import com.hospital.appointment.entity.SlotStatus;
import com.hospital.appointment.entity.TimeSlot;
import com.hospital.appointment.entity.Appointment;
import com.hospital.appointment.exception.BusinessException;
import com.hospital.appointment.exception.NotFoundException;
import com.hospital.appointment.repository.AuditLogRepository;
import com.hospital.appointment.repository.TimeSlotRepository;
import com.hospital.appointment.websocket.SlotEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Service de gestion des créneaux (TimeSlot).
 * Migré depuis Services/SlotService.cs (.NET).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final AuditLogRepository auditLogRepository;
    private final SlotEventPublisher events;

    private static final DateTimeFormatter SLOT_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.FRENCH);
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm");

    // ─────────────────────────────────────────────────────────────────
    //  CRÉATION D'UN CRÉNEAU UNIQUE
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public TimeSlotResponseDto create(CreateSlotDto dto, Integer doctorId) {
        if (!dto.endTime().isAfter(dto.startTime())) {
            throw new IllegalArgumentException("L'heure de fin doit être après l'heure de début.");
        }
        if (dto.startTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Impossible de créer un créneau dans le passé.");
        }

        checkOverlap(doctorId, dto.startTime(), dto.endTime());

        TimeSlot slot = TimeSlot.builder()
                .doctorId(doctorId)
                .startTime(dto.startTime())
                .endTime(dto.endTime())
                .status(SlotStatus.Available)
                .build();
        slot = timeSlotRepository.save(slot);

        auditLogRepository.save(AuditLog.builder()
                .userId(doctorId)
                .action("CREATE_SLOT")
                .entityType("TimeSlot")
                .entityId(slot.getId())
                .detail("%s – %s".formatted(
                        dto.startTime().format(SLOT_FMT),
                        dto.endTime().format(TIME_FMT)))
                .build());

        TimeSlotResponseDto result = mapToDto(slot, null);
        events.publishSlotAdded(result);
        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    //  CRÉATION EN MASSE (semaine entière)
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public List<TimeSlotResponseDto> createBulk(CreateBulkSlotsDto dto, Integer doctorId) {
        List<TimeSlot> created = new ArrayList<>();
        LocalDate currentDate = dto.weekStartDate();
        LocalDate weekEnd = currentDate.plusDays(7);

        while (currentDate.isBefore(weekEnd)) {
            if (dto.workDays().contains(currentDate.getDayOfWeek())) {
                LocalDateTime dayStart = currentDate.atTime(dto.slotStartTime());
                LocalDateTime dayEnd = currentDate.atTime(dto.slotEndTime());

                LocalDateTime cursor = dayStart;
                while (cursor.plusMinutes(dto.slotDurationMinutes()).isBefore(dayEnd.plusSeconds(1))) {
                    LocalDateTime slotEnd = cursor.plusMinutes(dto.slotDurationMinutes());

                    boolean overlap = timeSlotRepository.existsOverlap(doctorId, cursor, slotEnd);
                    if (!overlap) {
                        TimeSlot slot = TimeSlot.builder()
                                .doctorId(doctorId)
                                .startTime(cursor)
                                .endTime(slotEnd)
                                .status(SlotStatus.Available)
                                .build();
                        created.add(timeSlotRepository.save(slot));
                    }
                    cursor = slotEnd;
                }
            }
            currentDate = currentDate.plusDays(1);
        }

        List<TimeSlotResponseDto> dtos = new ArrayList<>();
        for (TimeSlot slot : created) {
            TimeSlotResponseDto d = mapToDto(slot, null);
            dtos.add(d);
            events.publishSlotAdded(d);
        }
        return dtos;
    }

    // ─────────────────────────────────────────────────────────────────
    //  BLOQUER / DÉBLOQUER
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void block(Integer slotId, Integer doctorId) {
        TimeSlot slot = timeSlotRepository.findByIdAndDoctorId(slotId, doctorId)
                .orElseThrow(() -> new NotFoundException("Créneau introuvable."));

        if (slot.getStatus() == SlotStatus.Reserved) {
            throw new BusinessException("Impossible de bloquer un créneau réservé.");
        }

        slot.setStatus(SlotStatus.Blocked);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        events.publishSlotStatusChanged(slot.getId(), "Blocked", false);
    }

    @Transactional
    public void unblock(Integer slotId, Integer doctorId) {
        TimeSlot slot = timeSlotRepository.findByIdAndDoctorId(slotId, doctorId)
                .orElseThrow(() -> new NotFoundException("Créneau introuvable."));

        if (slot.getStatus() != SlotStatus.Blocked) {
            throw new BusinessException("Ce créneau n'est pas bloqué.");
        }

        slot.setStatus(SlotStatus.Available);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        events.publishSlotStatusChanged(slot.getId(), "Available", true);
    }

    // ─────────────────────────────────────────────────────────────────
    //  CALENDRIER MÉDECIN
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<TimeSlotResponseDto> getWeekSlots(Integer doctorId, LocalDate weekStart) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = start.plusDays(7);

        return timeSlotRepository.findWeekSlotsByDoctor(doctorId, start, end)
                .stream()
                .map(t -> mapToDto(t, t.getAppointment()))
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isWeekFull(Integer doctorId, LocalDate weekStart) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = start.plusDays(7);
        return !timeSlotRepository.hasAvailableSlot(doctorId, start, end, SlotStatus.Available);
    }

    // ─────────────────────────────────────────────────────────────────
    //  CRÉNEAUX HOSPITALIERS (DoctorId NULL)
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<HospitalSlotResponseDto> getHospitalSlots(Integer serviceId, LocalDate weekStart) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = start.plusDays(7);

        return timeSlotRepository.findHospitalWeekSlots(serviceId, start, end)
                .stream()
                .map(t -> new HospitalSlotResponseDto(
                        t.getId(),
                        t.getStartTime(),
                        t.getEndTime(),
                        t.getStatus().name(),
                        t.getStatus() == SlotStatus.Available,
                        t.getServiceId() != null ? t.getServiceId() : 0,
                        t.getService() != null ? t.getService().getName() : ""))
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isHospitalWeekFull(Integer serviceId, LocalDate weekStart) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = start.plusDays(7);
        return !timeSlotRepository.hasAvailableHospitalSlot(serviceId, start, end, SlotStatus.Available);
    }

    // ─── Helpers privés ──────────────────────────────────────────────
    private void checkOverlap(Integer doctorId, LocalDateTime start, LocalDateTime end) {
        if (timeSlotRepository.existsOverlap(doctorId, start, end)) {
            throw new BusinessException("Ce créneau chevauche un créneau existant.");
        }
    }

    /**
     * Mapping vers le DTO de réponse, avec infos patient si réservé (FIX Bug 3).
     */
    static TimeSlotResponseDto mapToDto(TimeSlot t, Appointment appt) {
        String patientName = null;
        String patientEmail = null;
        Integer apptId = null;
        if (appt != null && appt.getPatient() != null) {
            patientName = appt.getPatient().getFullName();
            patientEmail = appt.getPatient().getEmail();
            apptId = appt.getId();
        }
        return new TimeSlotResponseDto(
                t.getId(),
                t.getStartTime(),
                t.getEndTime(),
                t.getStatus().name(),
                t.getStatus() == SlotStatus.Available,
                patientName,
                patientEmail,
                apptId);
    }
}
