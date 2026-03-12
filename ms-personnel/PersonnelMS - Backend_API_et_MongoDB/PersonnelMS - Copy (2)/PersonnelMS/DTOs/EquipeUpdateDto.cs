using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonnelMS.Enums;
using System.Collections.Generic;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la mise à jour d'une équipe.
    /// </summary>
    public class EquipeUpdateDto
    {
        [Required]
        [JsonPropertyName("nom")]
        public string Nom { get; set; } = default!;

        [JsonPropertyName("periodicite")]
        public Periodicite Periodicite { get; set; }

        [Range(1, int.MaxValue)]
        [JsonPropertyName("effectifCible")]
        public int EffectifCible { get; set; }

        [Range(1, int.MaxValue)]
        [JsonPropertyName("effectifMinimum")]
        public int EffectifMinimum { get; set; }

        [Required]
        [JsonPropertyName("chefEquipeId")]
        public string ChefEquipeId { get; set; } = default!;

        [JsonPropertyName("encadrantId")]
        public string? EncadrantId { get; set; }

        [JsonPropertyName("chefDeServiceId")]
        public string? ChefDeServiceId { get; set; }

        [JsonPropertyName("membreIds")]
        public List<string>? MembreIds { get; set; }
    }
}