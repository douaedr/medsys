package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/**
 * FEAT 1 + 6 — Créneau hebdomadaire récurrent attribué à un médecin par le chef de service.
 * Représente un emploi du temps hebdomadaire (par jour de semaine), pas un slot daté.
 */
@Entity
@Table(name = "creneaux_medecin")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreneauMedecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID du médecin (medecins_ref.id). */
    @Column(name = "medecin_id", nullable = false)
    private Long medecinId;

    /** ID du service (pour requêtes par service plus rapides). */
    @Column(name = "service_id")
    private Long serviceId;

    /** Jour de la semaine. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private JourSemaine jour;

    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;

    /** Type d'activité sur ce créneau. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TypeCreneau type;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    /** Notes optionnelles ajoutées par le chef. */
    @Column(length = 500)
    private String notes;

    public enum JourSemaine {
        LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE
    }

    public enum TypeCreneau {
        CONSULTATION,
        CONTROLE,
        OPERATION,
        URGENCE,
        ADMINISTRATIF
    }
}
