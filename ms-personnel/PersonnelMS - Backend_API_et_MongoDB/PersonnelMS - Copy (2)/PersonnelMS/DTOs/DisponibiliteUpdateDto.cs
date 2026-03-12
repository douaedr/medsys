using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la mise à jour d'une disponibilité.
    /// </summary>
    public class DisponibiliteUpdateDto
    {
        [JsonPropertyName("jour")]
        public JourSemaine Jour { get; set; }

        [Required]
        public TimeSpan HeureDebut { get; set; }

        [Required]
        public TimeSpan HeureFin { get; set; }

        [Required]
        [JsonPropertyName("priorite")]
        public Priorite Priorite { get; set; }

        [Required]
        public string PersonnelId { get; set; } = default!;
    }
}

