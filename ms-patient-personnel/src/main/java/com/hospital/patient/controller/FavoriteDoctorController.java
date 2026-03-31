package com.hospital.patient.controller;

import com.hospital.patient.dto.FavoriteDoctorDTO;
import com.hospital.patient.service.FavoriteDoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/favorites")
@RequiredArgsConstructor
public class FavoriteDoctorController {

    private final FavoriteDoctorService favoriteService;

    // GET /api/v1/patients/{patientId}/favorites
    @GetMapping
    public ResponseEntity<List<FavoriteDoctorDTO>> getFavorites(@PathVariable Long patientId) {
        return ResponseEntity.ok(favoriteService.getFavorites(patientId));
    }

    // POST /api/v1/patients/{patientId}/favorites
    @PostMapping
    public ResponseEntity<FavoriteDoctorDTO> addFavorite(
            @PathVariable Long patientId,
            @Valid @RequestBody FavoriteDoctorDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(favoriteService.addFavorite(patientId, dto));
    }

    // DELETE /api/v1/patients/{patientId}/favorites/{doctorId}
    @DeleteMapping("/{doctorId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @PathVariable Long patientId,
            @PathVariable Long doctorId) {
        favoriteService.removeFavorite(patientId, doctorId);
        return ResponseEntity.ok(Map.of("message", "Medecin retiré des favoris"));
    }
}
