package com.hospital.patient.service;

import com.hospital.patient.client.AuthServiceClient;
import com.hospital.patient.dto.*;
import com.hospital.patient.entity.MessagePersonnel;
import com.hospital.patient.repository.MessagePersonnelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessagePersonnelService {

    private final MessagePersonnelRepository repo;
    private final AuthServiceClient authClient;

    public List<MessagePersonnelDTO> getMessagesRecus(Long destinataireUserId) {
        return repo.findByDestinataireIdOrderByDateEnvoiDesc(destinataireUserId)
                .stream().map(this::toDto).toList();
    }

    public List<MessagePersonnelDTO> getMessagesEnvoyes(Long expediteurUserId) {
        return repo.findByExpediteurIdOrderByDateEnvoiDesc(expediteurUserId)
                .stream().map(this::toDto).toList();
    }

    public long countNonLus(Long destinataireUserId) {
        return repo.countByDestinataireIdAndLuFalse(destinataireUserId);
    }

    public MessagePersonnelDTO envoyer(Long expediteurUserId, String expediteurNom, String expediteurRole,
                                       EnvoyerMessageRequest req) {
        if (req.getDestinataireId() == null) {
            throw new IllegalArgumentException("destinataireId requis");
        }
        if (req.getContenu() == null || req.getContenu().isBlank()) {
            throw new IllegalArgumentException("Le message ne peut pas être vide");
        }
        if (req.getContenu().length() > 1000) {
            throw new IllegalArgumentException("Le message dépasse 1000 caractères");
        }
        // Récupérer le nom et rôle du destinataire via ms-auth
        CollegueDTO dest = null;
        try {
            List<CollegueDTO> users = authClient.getAllUsers();
            dest = users.stream().filter(u -> req.getDestinataireId().equals(u.getUserId())).findFirst().orElse(null);
        } catch (Exception ignored) {}

        MessagePersonnel msg = MessagePersonnel.builder()
                .expediteurId(expediteurUserId)
                .expediteurNom(expediteurNom)
                .expediteurRole(expediteurRole)
                .destinataireId(req.getDestinataireId())
                .destinataireNom(dest != null ? (safe(dest.getPrenom()) + " " + safe(dest.getNom())).trim() : null)
                .destinataireRole(dest != null ? dest.getRole() : null)
                .contenu(req.getContenu())
                .lu(false)
                .dateEnvoi(LocalDateTime.now())
                .priorite(req.getPriorite() != null ? req.getPriorite() : MessagePersonnel.Priorite.NORMALE)
                .build();
        msg = repo.save(msg);
        return toDto(msg);
    }

    public MessagePersonnelDTO marquerLu(Long destinataireUserId, Long messageId) {
        MessagePersonnel m = repo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message introuvable"));
        if (!destinataireUserId.equals(m.getDestinataireId())) {
            throw new IllegalStateException("Ce message ne vous est pas destiné");
        }
        if (Boolean.FALSE.equals(m.getLu())) {
            m.setLu(true);
            m.setDateLecture(LocalDateTime.now());
            m = repo.save(m);
        }
        return toDto(m);
    }

    public List<CollegueDTO> getCollegues(Long currentUserId) {
        return authClient.getAllPersonnel().stream()
                .filter(u -> u.getUserId() == null || !u.getUserId().equals(currentUserId))
                .toList();
    }

    private MessagePersonnelDTO toDto(MessagePersonnel m) {
        return MessagePersonnelDTO.builder()
                .id(m.getId())
                .expediteurId(m.getExpediteurId())
                .expediteurNom(m.getExpediteurNom())
                .expediteurRole(m.getExpediteurRole())
                .destinataireId(m.getDestinataireId())
                .destinataireNom(m.getDestinataireNom())
                .destinataireRole(m.getDestinataireRole())
                .contenu(m.getContenu())
                .lu(m.getLu())
                .dateEnvoi(m.getDateEnvoi())
                .dateLecture(m.getDateLecture())
                .priorite(m.getPriorite())
                .build();
    }

    private String safe(String s) { return s != null ? s : ""; }
}
