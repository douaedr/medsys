package com.hospital.patient.controller;

import com.hospital.patient.dto.*;
import com.hospital.patient.service.PatientDashboardService;
import com.hospital.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final PatientDashboardService dashboardService;

    // ─── POST /api/v1/patients ───────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<PatientResponseDTO> createPatient(
            @Valid @RequestBody PatientRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(patientService.createPatient(dto));
    }

    // ─── GET /api/v1/patients ────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Page<PatientResponseDTO>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nom") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(patientService.getAllPatients(pageable));
    }

    // ─── GET /api/v1/patients/search ─────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<Page<PatientResponseDTO>> searchPatients(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(patientService.searchPatients(q, pageable));
    }

    // ─── GET /api/v1/patients/{id} ───────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    // ─── GET /api/v1/patients/cin/{cin} ─────────────────────────────────────
    @GetMapping("/cin/{cin}")
    public ResponseEntity<PatientResponseDTO> getPatientByCin(@PathVariable String cin) {
        return ResponseEntity.ok(patientService.getPatientByCin(cin));
    }

    // ─── PUT /api/v1/patients/{id} ───────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequestDTO dto) {
        return ResponseEntity.ok(patientService.updatePatient(id, dto));
    }

    // ─── DELETE /api/v1/patients/{id} ────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    // ─── GET /api/v1/patients/statistiques ───────────────────────────────────
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Long>> getStatistiques() {
        return ResponseEntity.ok(patientService.getStatistiques());
    }

    // ─── GET /api/v1/patients/{id}/dossier ───────────────────────────────────
    @GetMapping("/{id}/dossier")
    public ResponseEntity<DossierMedicalDTO> getDossierMedical(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getDossierMedical(id));
    }

    // ─── GET /api/v1/patients/{id}/dashboard ─────────────────────────────────
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<PatientDashboardDTO> getDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getDashboard(id));
    }

    // ─── GET /api/v1/patients/{id}/appointments ───────────────────────────────
    @GetMapping("/{id}/appointments")
    public ResponseEntity<java.util.List<AppointmentRecordDTO>> getAppointments(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getAppointmentHistory(id));
    }

    // ─── POST /api/v1/patients/{id}/appointments/{appointmentId}/rebook ──────
    @PostMapping("/{id}/appointments/{appointmentId}/rebook")
    public ResponseEntity<AppointmentRebookDTO> rebookAppointment(
            @PathVariable Long id,
            @PathVariable Long appointmentId) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(dashboardService.rebookAppointment(id, appointmentId));
    }

    // ─── GET /api/v1/patients/{id}/appointments/next-available ───────────────
    @GetMapping("/{id}/appointments/next-available")
    public ResponseEntity<NextAvailableSlotDTO> getNextAvailableSlot(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.suggestNextSlot(id));
    }
}
