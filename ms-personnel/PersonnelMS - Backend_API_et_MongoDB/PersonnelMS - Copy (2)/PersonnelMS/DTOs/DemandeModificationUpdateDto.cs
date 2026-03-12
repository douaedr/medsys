using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la mise à jour d'une demande de modification (tant que le statut est EN_ATTENTE).
    /// </summary>
    public class DemandeModificationUpdateDto
    {
        [JsonPropertyName("type")]
        public TypeModification Type { get; set; }

        [Required]
        [JsonPropertyName("motif")]
        public string Motif { get; set; } = default!;

        public List<string>? CreneauIds { get; set; }
    }
}

