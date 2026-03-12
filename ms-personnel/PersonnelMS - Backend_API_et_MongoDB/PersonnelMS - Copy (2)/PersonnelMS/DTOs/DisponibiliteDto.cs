using System;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'une disponibilité.
    /// </summary>
    public class DisponibiliteDto
    {
        public string Id { get; set; } = default!;
        public JourSemaine Jour { get; set; }
        public TimeSpan HeureDebut { get; set; }
        public TimeSpan HeureFin { get; set; }
        public Priorite Priorite { get; set; }
        public string PersonnelId { get; set; } = default!;
    }
}

