using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO de mise à jour pour un infirmier.
    /// </summary>
    public class InfirmierUpdateDto
    {
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
        
        [Required]
        public string Unite { get; set; } = default!;
        [Required]
        public string Diplome { get; set; } = default!;

        /// <summary>
        /// Type d'infirmier (standard ou majorant). Utilisé pour validation, sans changer le type persistant.
        /// </summary>
        [Required]
        [JsonPropertyName("type")]
        public TypeInfirmier Type { get; set; }
    }
}