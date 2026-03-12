using System;
using System.Collections.Generic;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'une demande de modification de planning.
    /// </summary>
    public class DemandeModificationDto
    {
        public string Id { get; set; } = default!;
        public TypeModification Type { get; set; }
        public string Motif { get; set; } = default!;
        public StatutDemande Statut { get; set; }
        public DateTime DateDemande { get; set; }
        public string PersonnelId { get; set; } = default!;
        public string? TraiteurId { get; set; }
        public List<string>? CreneauIds { get; set; }
    }
}

