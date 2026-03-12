using System;
using System.ComponentModel.DataAnnotations;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO de base pour un médecin.
    /// </summary>
    public class MedecinDto : PersonnelDto
    {
        [Required]
        public string Specialite { get; set; } = default!;

        [Required]
        public string NumeroOrdre { get; set; } = default!;

        public string? TitresProfessionnels { get; set; }
    }
}