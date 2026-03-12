using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la mise à jour d'une absence (tant que le statut est EN_ATTENTE).
    /// </summary>
    public class AbsenceUpdateDto
    {
        [JsonPropertyName("type")]
        public TypeAbsence Type { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DateDebut { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DateFin { get; set; }

        [Required]
        public string Motif { get; set; } = default!;

        public string? Justificatif { get; set; }

        [Required]
        public string PersonnelId { get; set; } = default!;
    }
}

