package com.hospital.patient.service;

import com.hospital.patient.dto.FavoriteDoctorDTO;
import com.hospital.patient.entity.FavoriteDoctor;
import com.hospital.patient.exception.PatientNotFoundException;
import com.hospital.patient.repository.FavoriteDoctorRepository;
import com.hospital.patient.repository.PatientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteDoctorService {

    private final FavoriteDoctorRepository favoriteRepo;
    private final PatientRepository patientRepo;

    public List<FavoriteDoctorDTO> getFavorites(Long patientId) {
        assertPatientExists(patientId);
        return favoriteRepo.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FavoriteDoctorDTO addFavorite(Long patientId, FavoriteDoctorDTO dto) {
        assertPatientExists(patientId);
        if (favoriteRepo.existsByPatientIdAndDoctorId(patientId, dto.getDoctorId())) {
            throw new IllegalStateException("Ce medecin est deja dans vos favoris");
        }
        FavoriteDoctor entity = FavoriteDoctor.builder()
                .patientId(patientId)
                .doctorId(dto.getDoctorId())
                .doctorName(dto.getDoctorName())
                .specialty(dto.getSpecialty())
                .build();
        return toDTO(favoriteRepo.save(entity));
    }

    @Transactional
    public void removeFavorite(Long patientId, Long doctorId) {
        assertPatientExists(patientId);
        if (!favoriteRepo.existsByPatientIdAndDoctorId(patientId, doctorId)) {
            throw new PatientNotFoundException("Favori introuvable");
        }
        favoriteRepo.deleteByPatientIdAndDoctorId(patientId, doctorId);
    }

    private void assertPatientExists(Long patientId) {
        if (!patientRepo.existsById(patientId)) {
            throw new PatientNotFoundException("Patient introuvable: " + patientId);
        }
    }

    private FavoriteDoctorDTO toDTO(FavoriteDoctor f) {
        return FavoriteDoctorDTO.builder()
                .id(f.getId())
                .doctorId(f.getDoctorId())
                .doctorName(f.getDoctorName())
                .specialty(f.getSpecialty())
                .addedAt(f.getAddedAt())
                .build();
    }
}
