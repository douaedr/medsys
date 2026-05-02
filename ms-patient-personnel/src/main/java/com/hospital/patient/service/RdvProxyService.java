package com.hospital.patient.service;

import com.hospital.patient.dto.CreerRdvRequest;
import com.hospital.patient.dto.RendezVousDTO;
import com.hospital.patient.entity.AppointmentRecord;
import com.hospital.patient.repository.AppointmentRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RdvProxyService {

    @Value("${ms-rdv.url:}")
    private String msRdvUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final AppointmentRecordRepository appointmentRepo;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ─────────────────────────────────────────────────────────────────────────
    //  LECTURE
    // ─────────────────────────────────────────────────────────────────────────
    public List<RendezVousDTO> getRdvPatient(Long patientId, String patientEmail) {
        if (msRdvUrl == null || msRdvUrl.isBlank()) {
            log.debug("ms-rdv.url non configuré, retour des données locales pour patient {}", patientId);
            return localRecords(patientId);
        }
        try {
            String url = UriComponentsBuilder.fromHttpUrl(msRdvUrl)
                    .path("/api/internal/rdv/patient/{email}")
                    .buildAndExpand(patientEmail)
                    .toUriString();
            ResponseEntity<List<RendezVousDTO>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            List<RendezVousDTO> remote = response.getBody() != null ? response.getBody() : List.of();
            if (!remote.isEmpty()) return remote;
            return localRecords(patientId);
        } catch (Exception e) {
            log.warn("ms-rdv injoignable ({}), fallback local pour patient {}: {}", msRdvUrl, patientId, e.getMessage());
            return localRecords(patientId);
        }
    }

    public List<RendezVousDTO> getRdvPatient(Long patientId) {
        return getRdvPatient(patientId, null);
    }

    public List<RendezVousDTO> getAllRdv() {
        if (msRdvUrl == null || msRdvUrl.isBlank()) {
            return appointmentRepo.findAll().stream()
                    .map(this::toRendezVousDTO).collect(Collectors.toList());
        }
        try {
            String url = msRdvUrl + "/api/v1/rdv";
            ResponseEntity<List<RendezVousDTO>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            return response.getBody() != null ? response.getBody() : List.of();
        } catch (Exception e) {
            log.warn("Impossible de joindre ms-rdv (getAllRdv): {}", e.getMessage());
            return appointmentRepo.findAll().stream()
                    .map(this::toRendezVousDTO).collect(Collectors.toList());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  CRÉATION D'UN RDV DEPUIS LE PATIENT
    // ─────────────────────────────────────────────────────────────────────────
    public RendezVousDTO creerRdv(Long patientId, String patientEmail, CreerRdvRequest req) {

        // Si appointment-service est configuré, on délègue
        if (msRdvUrl != null && !msRdvUrl.isBlank()) {
            try {
                String url = msRdvUrl + "/api/internal/rdv/patient/creer";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> body = Map.of(
                        "patientId",   patientId,
                        "patientEmail", patientEmail != null ? patientEmail : "",
                        "medecinId",   req.getMedecinId(),
                        "dateHeure",   req.getDateHeure(),
                        "motif",       req.getMotif() != null ? req.getMotif() : ""
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<RendezVousDTO> response = restTemplate.postForEntity(url, entity, RendezVousDTO.class);

                if (response.getBody() != null) {
                    log.info("RDV créé via appointment-service pour patient {}", patientId);
                    return response.getBody();
                }
            } catch (Exception e) {
                log.warn("Impossible de créer RDV via appointment-service, fallback local: {}", e.getMessage());
            }
        }

        // Fallback : créer en local (AppointmentRecord)
        return creerRdvLocal(patientId, req);
    }

    private RendezVousDTO creerRdvLocal(Long patientId, CreerRdvRequest req) {
        LocalDateTime dateHeure;
        try {
            dateHeure = LocalDateTime.parse(req.getDateHeure(),
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
        } catch (Exception e) {
            try {
                dateHeure = LocalDateTime.parse(req.getDateHeure());
            } catch (Exception e2) {
                throw new IllegalArgumentException("Format de date invalide. Attendu : yyyy-MM-ddTHH:mm:ss");
            }
        }

        if (dateHeure.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Impossible de prendre un rendez-vous dans le passé.");
        }

        AppointmentRecord record = new AppointmentRecord();
        record.setPatientId(patientId);
        record.setAppointmentDate(dateHeure);
        record.setNotes(req.getMotif());
        record.setStatus("SCHEDULED");
        record.setRecordedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());

        // Récupérer infos médecin si disponible
        if (req.getMedecinId() != null) {
            record.setDoctorName("Dr. " + req.getMedecinId());
        }

        record.setExternalAppointmentId("LOCAL-" + System.currentTimeMillis());

        AppointmentRecord saved = appointmentRepo.save(record);
        log.info("RDV créé localement pour patient {} à {}", patientId, dateHeure);
        return toRendezVousDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  ANNULATION
    // ─────────────────────────────────────────────────────────────────────────
    public boolean annulerRdv(Long rdvId, Long patientId, String patientEmail) {
        if (msRdvUrl == null || msRdvUrl.isBlank()) {
            return annulerLocal(rdvId, patientId);
        }
        try {
            String url = UriComponentsBuilder.fromHttpUrl(msRdvUrl)
                    .path("/api/internal/rdv/{rdvId}/annuler")
                    .queryParam("email", patientEmail != null ? patientEmail : "")
                    .buildAndExpand(rdvId)
                    .toUriString();
            restTemplate.put(url, null);
            annulerLocal(rdvId, patientId);
            return true;
        } catch (Exception e) {
            log.warn("Impossible d'annuler RDV {} via ms-rdv bridge, annulation locale: {}", rdvId, e.getMessage());
            return annulerLocal(rdvId, patientId);
        }
    }

    public boolean annulerRdv(Long rdvId, Long patientId) {
        return annulerRdv(rdvId, patientId, null);
    }

    private boolean annulerLocal(Long rdvId, Long patientId) {
        return appointmentRepo.findById(rdvId)
                .filter(r -> r.getPatientId().equals(patientId))
                .map(r -> {
                    r.setStatus("CANCELLED");
                    r.setUpdatedAt(LocalDateTime.now());
                    appointmentRepo.save(r);
                    log.info("RDV {} annulé localement pour patient {}", rdvId, patientId);
                    return true;
                })
                .orElse(false);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    private List<RendezVousDTO> localRecords(Long patientId) {
        return appointmentRepo.findByPatientIdOrderByAppointmentDateDesc(patientId)
                .stream().map(this::toRendezVousDTO).collect(Collectors.toList());
    }

    private RendezVousDTO toRendezVousDTO(AppointmentRecord r) {
        String date = r.getAppointmentDate() != null
                ? r.getAppointmentDate().format(DATE_FMT) : null;
        String heure = r.getAppointmentDate() != null
                ? r.getAppointmentDate().format(TIME_FMT) : null;

        String statut = switch (r.getStatus() != null ? r.getStatus() : "") {
            case "SCHEDULED"  -> "EN_ATTENTE";
            case "COMPLETED"  -> "TERMINE";
            case "CANCELLED"  -> "ANNULE";
            case "CONFIRMED"  -> "CONFIRME";
            default           -> "EN_ATTENTE";
        };

        return RendezVousDTO.builder()
                .id(r.getId())
                .date(date)
                .heure(heure)
                .motif(r.getNotes())
                .statut(statut)
                .medecinNom(r.getDoctorName())
                .medecinSpecialite(r.getSpecialty())
                .notes(r.getNotes())
                .build();
    }
}