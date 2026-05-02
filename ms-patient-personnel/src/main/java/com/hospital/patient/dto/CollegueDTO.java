package com.hospital.patient.dto;

import lombok.*;

/**
 * FEAT 2 — Représentation d'un collègue pour le sélecteur de destinataire.
 * Retourné par GET /api/v1/personnel/collegues.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegueDTO {
    /** UserAccount.id côté ms-auth — utilisé comme destinataireId. */
    private Long userId;
    private String email;
    private String nom;
    private String prenom;
    private String role;
    /** ID dans medecins_ref (si applicable). */
    private Long personnelId;
}
