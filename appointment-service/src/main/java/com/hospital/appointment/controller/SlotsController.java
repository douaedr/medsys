package com.hospital.appointment.controller;

import com.hospital.appointment.dto.slot.CreateBulkSlotsDto;
import com.hospital.appointment.dto.slot.CreateSlotDto;
import com.hospital.appointment.dto.slot.HospitalSlotResponseDto;
import com.hospital.appointment.dto.slot.TimeSlotResponseDto;
import com.hospital.appointment.exception.UnauthorizedException;
import com.hospital.appointment.security.SecurityUtils;
import com.hospital.appointment.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Migré depuis Controllers/SlotsController.cs (.NET).
 */
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotsController {

    private final SlotService slotService;

    // POST /api/slots — Doctor uniquement
    @PostMapping
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<TimeSlotResponseDto> create(@Valid @RequestBody CreateSlotDto dto) {
        Integer doctorId = SecurityUtils.getCurrentUserId();
        if (doctorId == null) throw new UnauthorizedException("Auth requise.");
        return ResponseEntity.ok(slotService.create(dto, doctorId));
    }

    // POST /api/slots/bulk — Doctor uniquement
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<List<TimeSlotResponseDto>> createBulk(@Valid @RequestBody CreateBulkSlotsDto dto) {
        Integer doctorId = SecurityUtils.getCurrentUserId();
        if (doctorId == null) throw new UnauthorizedException("Auth requise.");
        return ResponseEntity.ok(slotService.createBulk(dto, doctorId));
    }

    // PATCH /api/slots/{id}/block — Doctor
    @PatchMapping("/{id}/block")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<Void> block(@PathVariable Integer id) {
        Integer doctorId = SecurityUtils.getCurrentUserId();
        if (doctorId == null) throw new UnauthorizedException("Auth requise.");
        slotService.block(id, doctorId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/slots/{id}/unblock — Doctor
    @PatchMapping("/{id}/unblock")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<Void> unblock(@PathVariable Integer id) {
        Integer doctorId = SecurityUtils.getCurrentUserId();
        if (doctorId == null) throw new UnauthorizedException("Auth requise.");
        slotService.unblock(id, doctorId);
        return ResponseEntity.noContent().build();
    }

    // GET /api/slots/doctor/{doctorId}/week?weekStart=YYYY-MM-DD — public
    @GetMapping("/doctor/{doctorId}/week")
    public ResponseEntity<List<TimeSlotResponseDto>> getDoctorWeek(
            @PathVariable Integer doctorId,
            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(slotService.getWeekSlots(doctorId, weekStart));
    }

    // GET /api/slots/doctor/{doctorId}/week-full?weekStart=...
    @GetMapping("/doctor/{doctorId}/week-full")
    public ResponseEntity<Boolean> isDoctorWeekFull(
            @PathVariable Integer doctorId,
            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(slotService.isWeekFull(doctorId, weekStart));
    }

    // GET /api/slots/hospital/{serviceId}/week?weekStart=...
    @GetMapping("/hospital/{serviceId}/week")
    public ResponseEntity<List<HospitalSlotResponseDto>> getHospitalWeek(
            @PathVariable Integer serviceId,
            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(slotService.getHospitalSlots(serviceId, weekStart));
    }

    // GET /api/slots/hospital/{serviceId}/week-full?weekStart=...
    @GetMapping("/hospital/{serviceId}/week-full")
    public ResponseEntity<Boolean> isHospitalWeekFull(
            @PathVariable Integer serviceId,
            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(slotService.isHospitalWeekFull(serviceId, weekStart));
    }
}
