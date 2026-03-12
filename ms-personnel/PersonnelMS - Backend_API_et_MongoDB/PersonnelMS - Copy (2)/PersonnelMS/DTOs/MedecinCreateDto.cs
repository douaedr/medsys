using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la création d'un médecin (toutes spécialités confondues).
    /// Le champ <see cref="Type"/> indique la sous-classe à instancier.
    /// </summary>
    public class MedecinCreateDto
    {
        [JsonPropertyName("type")]
        public TypeMedecin Type { get; set; }

        [Required]
        public string Nom { get; set; } = default!;

        [Required]
        public string Prenom { get; set; } = default!;

        [Required]
        [EmailAddress]
        public string Courriel { get; set; } = default!;

        [RegularExpression("^\\+?[0-9]{10,15}$")]
        public string? Telephone { get; set; }

        [Required]
        public string Matricule { get; set; } = default!;

        [Required]
        [JsonPropertyName("statut")]
        public Statut Statut { get; set; }

        [Required]
        public System.DateTime DateEmbauche { get; set; }

        [Required]
        public string Poste { get; set; } = default!;

        // champs spécifiques aux médecins
        [Required]
        public string Specialite { get; set; } = default!;

        [Required]
        public string NumeroOrdre { get; set; } = default!;

        public string? TitresProfessionnels { get; set; }

        // champs pour les juniors
        public string? Promotion { get; set; }
        public string? NiveauFormation { get; set; }

        // champ pour chef de service
        public string? ServiceNom { get; set; }
    }
}