using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO de mise à jour pour un médecin. Le type ne peut pas être modifié.
    /// </summary>
    public class MedecinUpdateDto
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

        // spécialité spécifique
        [Required]
        public string Specialite { get; set; } = default!;

        [Required]
        public string NumeroOrdre { get; set; } = default!;

        public string? TitresProfessionnels { get; set; }

        public string? Promotion { get; set; }
        public string? NiveauFormation { get; set; }
        public string? ServiceNom { get; set; }
    }
}