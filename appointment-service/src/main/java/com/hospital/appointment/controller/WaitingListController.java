package com.hospital.appointment.controller;

import com.hospital.appointment.dto.waitinglist.JoinWaitingListDto;
import com.hospital.appointment.dto.waitinglist.WaitingListEntryResponseDto;
import com.hospital.appointment.entity.WaitingListEntry;
import com.hospital.appointment.exception.BusinessException;
import com.hospital.appointment.exception.NotFoundException;
import com.hospital.appointment.exception.UnauthorizedException;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.repository.WaitingListEntryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Migré depuis Controllers/WaitingListController.cs (.NET).
 */
@RestController
@RequestMapping("/api/waiting-list")
@RequiredArgsConstructor
public class WaitingListController {

    private final WaitingListEntryRepository waitingListRepository;
    private final UserRepository userRepository;

    // POST /api/waiting-list — public
    @PostMapping
    public ResponseEntity<WaitingListEntryResponseDto> join(@Valid @RequestBody JoinWaitingListDto dto) {
        var doctor = userRepository.findById(dto.doctorId())
                .orElseThrow(() -> new NotFoundException("Médecin introuvable."));

        // Évite les doublons (même médecin, même semaine, même email)
        var existing = waitingListRepository
                .findByDoctorIdAndWeekStartDate(dto.doctorId(), dto.weekStartDate());
        boolean alreadyIn = existing.stream()
                .anyMatch(e -> e.getEmail().equalsIgnoreCase(dto.email()));
        if (alreadyIn) {
            throw new BusinessException("Vous êtes déjà inscrit(e) sur cette liste d'attente.");
        }

        WaitingListEntry entry = WaitingListEntry.builder()
                .doctorId(dto.doctorId())
                .weekStartDate(dto.weekStartDate())
                .patientName(dto.patientName())
                .email(dto.email())
                .phone(dto.phone())
                .build();
        entry = waitingListRepository.save(entry);

        return ResponseEntity.ok(toDto(entry));
    }

    // GET /api/waiting-list/doctor/{doctorId}?weekStart=...
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<WaitingListEntryResponseDto>> listForDoctor(
            @PathVariable Integer doctorId,
            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(
                waitingListRepository
                        .findByDoctorIdAndWeekStartDateOrderByCreatedAtAsc(doctorId, weekStart)
                        .stream().map(this::toDto).toList());
    }

    // DELETE /api/waiting-list/{id}?email=...
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> leave(@PathVariable Integer id, @RequestParam String email) {
        WaitingListEntry entry = waitingListRepository.findByIdAndEmail(id, email)
                .orElseThrow(() -> new UnauthorizedException("Inscription introuvable ou email invalide."));
        waitingListRepository.delete(entry);
        return ResponseEntity.noContent().build();
    }

    private WaitingListEntryResponseDto toDto(WaitingListEntry e) {
        return new WaitingListEntryResponseDto(
                e.getId(), e.getDoctorId(), e.getWeekStartDate(),
                e.getPatientName(), e.getEmail(), e.getPhone(),
                e.getNotifiedAt(), e.getCreatedAt());
    }
}
