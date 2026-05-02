package com.hospital.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 🔧 V4: DTO pour la modification de l'email utilisateur.
 *
 * Demande : nouvel email + mot de passe actuel (sécurité)
 */
@Data
public class ChangeEmailRequest {

    @NotBlank(message = "Le nouvel email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String newEmail;

    @NotBlank(message = "Le mot de passe actuel est obligatoire pour confirmer la modification")
    private String currentPassword;
}
