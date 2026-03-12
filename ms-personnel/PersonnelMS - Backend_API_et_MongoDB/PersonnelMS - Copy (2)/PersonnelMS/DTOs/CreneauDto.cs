using System;
using System.Collections.Generic;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'un créneau.
    /// </summary>
    public class CreneauDto
    {
        public string Id { get; set; } = default!;
        public DateTime Debut { get; set; }
        public DateTime Fin { get; set; }
        public TypeCreneau Type { get; set; }
        public StatutCreneau Statut { get; set; }
        public string Lieu { get; set; } = default!;
        public List<string> PersonnelIds { get; set; } = new List<string>();
        public string PlanningId { get; set; } = default!;
    }
}