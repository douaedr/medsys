package com.hospital.patient.dto;

import com.hospital.patient.enums.GroupeSanguin;
import com.hospital.patient.enums.Sexe;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le CIN est obligatoire")
    private String cin;

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    private LocalDate dateNaissance;

    private Sexe sexe;
    private GroupeSanguin groupeSanguin;

    private String telephone;

    @Email(message = "Format email invalide")
    private String email;

    private String adresse;
    private String ville;
    private String mutuelle;
    private String numeroCNSS;

    // Optionnel : antécédents, ordonnances, analyses à créer avec le patient
    private List<AntecedentItem> antecedents;
    private List<OrdonnanceItem> ordonnances;
    private List<AnalyseItem> analyses;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AntecedentItem {
        private String type;           // MEDICAL, CHIRURGICAL, FAMILIAL, ALLERGIE
        private String description;
        private LocalDate dateApparition;
        private Boolean actif = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdonnanceItem {
        private LocalDate date;
        private String type;           // TRAITEMENT_COURT, TRAITEMENT_LONG, RENOUVELLEMENT
        private String medicaments;    // texte libre des médicaments
        private String observations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyseItem {
        private String typeAnalyse;
        private LocalDate dateAnalyse;
        private String resultats;
        private String laboratoire;
        private String statut;         // EN_ATTENTE, TERMINE, EN_COURS
    }
}
