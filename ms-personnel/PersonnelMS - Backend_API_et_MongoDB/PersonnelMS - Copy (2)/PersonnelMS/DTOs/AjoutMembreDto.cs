using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour l'ajout d'un membre à une équipe.
    /// </summary>
    public class AjoutMembreDto
    {
        [Required]
        [JsonPropertyName("personnelId")]
        public string PersonnelId { get; set; } = default!;
    }
}

