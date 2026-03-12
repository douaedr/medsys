using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la création d'un planning.
    /// </summary>
    public class PlanningCreateDto
    {
        [Required]
        [JsonPropertyName("nom")]
        public string Nom { get; set; } = default!;

        [Required]
        [JsonPropertyName("dateDebut")]
        public DateTime DateDebut { get; set; }

        [Required]
        [JsonPropertyName("dateFin")]
        public DateTime DateFin { get; set; }

        [JsonPropertyName("statut")]
        public StatutPlanning Statut { get; set; }

        [Required]
        [JsonPropertyName("equipeId")]
        public string EquipeId { get; set; } = default!;
    }
}