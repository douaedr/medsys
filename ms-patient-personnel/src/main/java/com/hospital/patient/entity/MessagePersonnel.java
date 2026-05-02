package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * FEAT 2 — Messages entre membres du personnel (médecin, secrétaire, infirmier, etc.).
 * Distinct de la messagerie patient↔médecin (qui passe par MessagePatientMedecin).
 */
@Entity
@Table(name = "messages_personnel", indexes = {
        @Index(name = "idx_msg_destinataire", columnList = "destinataire_id, lu"),
        @Index(name = "idx_msg_expediteur", columnList = "expediteur_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagePersonnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID expéditeur (UserAccount.id côté ms-auth, ou personnelId). On utilise userId. */
    @Column(name = "expediteur_id", nullable = false)
    private Long expediteurId;

    @Column(name = "expediteur_nom", length = 200)
    private String expediteurNom;

    @Column(name = "expediteur_role", length = 32)
    private String expediteurRole;

    @Column(name = "destinataire_id", nullable = false)
    private Long destinataireId;

    @Column(name = "destinataire_nom", length = 200)
    private String destinataireNom;

    @Column(name = "destinataire_role", length = 32)
    private String destinataireRole;

    @Column(nullable = false, length = 1000)
    private String contenu;

    @Column(nullable = false)
    @Builder.Default
    private Boolean lu = false;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private Priorite priorite = Priorite.NORMALE;

    @PrePersist
    protected void onCreate() {
        if (dateEnvoi == null) dateEnvoi = LocalDateTime.now();
        if (lu == null) lu = false;
        if (priorite == null) priorite = Priorite.NORMALE;
    }

    public enum Priorite {
        NORMALE, URGENTE
    }
}
