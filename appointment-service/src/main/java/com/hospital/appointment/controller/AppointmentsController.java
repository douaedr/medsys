package com.hospital.appointment.controller;

import com.hospital.appointment.dto.appointment.AppointmentResponseDto;
import com.hospital.appointment.dto.appointment.BookAppointmentDto;
import com.hospital.appointment.dto.appointment.CancelAppointmentDto;
import com.hospital.appointment.dto.appointment.UpdateAppointmentDto;
import com.hospital.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Migré depuis Controllers/AppointmentsController.cs (.NET).
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentsController {

    private final AppointmentService appointmentService;

    // POST /api/appointments  — public (anonyme ou connecté)
    @PostMapping
    public ResponseEntity<AppointmentResponseDto> book(@Valid @RequestBody BookAppointmentDto dto) {
        return ResponseEntity.ok(appointmentService.book(dto));
    }

    // DELETE /api/appointments — public (anonyme ou connecté avec token)
    @DeleteMapping
    public ResponseEntity<Void> cancel(@Valid @RequestBody CancelAppointmentDto dto) {
        appointmentService.cancel(dto);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/appointments — utilisateur connecté
    @PutMapping
    public ResponseEntity<AppointmentResponseDto> reschedule(@Valid @RequestBody UpdateAppointmentDto dto) {
        return ResponseEntity.ok(appointmentService.reschedule(dto));
    }

    // GET /api/appointments/me — utilisateur connecté
    @GetMapping("/me")
    public ResponseEntity<List<AppointmentResponseDto>> getMine() {
        return ResponseEntity.ok(appointmentService.getMine());
    }

    // GET /api/appointments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(appointmentService.getById(id));
    }

    // POST /api/appointments/secretaire -- reserve par la secretaire
    @PostMapping("/secretaire")
    public ResponseEntity<AppointmentResponseDto> createRdvSecretaire(
            @Valid @RequestBody com.hospital.appointment.dto.SecretaireRdvRequest request) {

        AppointmentResponseDto response = appointmentService.createRdvSecretaire(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }
}