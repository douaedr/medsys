using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la création d'une demande de modification de planning.
    /// </summary>
    public class DemandeModificationCreateDto
    {
        [JsonPropertyName("type")]
        public TypeModification Type { get; set; }

        [Required]
        [JsonPropertyName("motif")]
        public string Motif { get; set; } = default!;

        [Required]
        public string PersonnelId { get; set; } = default!;

        public List<string>? CreneauIds { get; set; }
    }
}

