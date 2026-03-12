using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la mise à jour complète d'un personnel.
    /// </summary>
    public class PersonnelUpdateDto
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
        public DateTime DateEmbauche { get; set; }

        [Required]
        public string Poste { get; set; } = default!;
    }
}