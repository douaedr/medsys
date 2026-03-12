using System;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'une absence.
    /// </summary>
    public class AbsenceDto
    {
        public string Id { get; set; } = default!;
        public TypeAbsence Type { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string Motif { get; set; } = default!;
        public StatutAbsence Statut { get; set; }
        public string? Justificatif { get; set; }
        public string PersonnelId { get; set; } = default!;
        public string? ValideurId { get; set; }
    }
}

