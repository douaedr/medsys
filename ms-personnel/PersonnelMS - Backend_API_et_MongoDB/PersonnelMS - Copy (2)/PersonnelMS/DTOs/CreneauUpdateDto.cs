using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la mise à jour d'un créneau.
    /// </summary>
    public class CreneauUpdateDto
    {
        [Required]
        [JsonPropertyName("debut")]
        public DateTime Debut { get; set; }

        [Required]
        [JsonPropertyName("fin")]
        public DateTime Fin { get; set; }

        [Required]
        [JsonPropertyName("type")]
        public TypeCreneau Type { get; set; }

        [Required]
        [JsonPropertyName("statut")]
        public StatutCreneau Statut { get; set; }

        [Required]
        [JsonPropertyName("lieu")]
        public string Lieu { get; set; } = default!;

        [JsonPropertyName("personnelIds")]
        public List<string>? PersonnelIds { get; set; }

        [Required]
        [JsonPropertyName("planningId")]
        public string PlanningId { get; set; } = default!;
    }
}