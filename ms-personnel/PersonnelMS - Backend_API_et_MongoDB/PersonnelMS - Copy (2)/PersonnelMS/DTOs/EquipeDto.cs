using System.Collections.Generic;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'une équipe.
    /// </summary>
    public class EquipeDto
    {
        public string Id { get; set; } = default!;
        public string Nom { get; set; } = default!;
        public Periodicite Periodicite { get; set; }
        public int EffectifCible { get; set; }
        public int EffectifMinimum { get; set; }
        public string? ChefEquipeId { get; set; }
        public string? EncadrantId { get; set; }
        public List<string> MembreIds { get; set; } = new List<string>();
        public string? ChefDeServiceId { get; set; }
    }
}