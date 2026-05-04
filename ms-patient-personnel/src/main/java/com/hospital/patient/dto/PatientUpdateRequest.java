package com.hospital.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PatientUpdateRequest {

    private String nom;
    private String prenom;

    @Email(message = "Email invalide")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Telephone invalide")
    private String telephone;

    private String adresse;
    private String ville;
    private String dateNaissance;
    private String groupeSanguin;
    private String cin;
    private String mutuelle;
    private String notes;
}