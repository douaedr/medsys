using System.Collections.Generic;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour le rapport de taux d'occupation des créneaux.
    /// </summary>
    public class TauxOccupationDto
    {
        /// <summary>
        /// Taux global (0-100).
        /// </summary>
        public double TauxGlobal { get; set; }

        /// <summary>
        /// Détails par équipe ou par période.
        /// </summary>
        public List<DetailTauxOccupationDto> Details { get; set; } = new List<DetailTauxOccupationDto>();
    }

    /// <summary>
    /// Détail du taux d'occupation pour une équipe.
    /// </summary>
    public class DetailTauxOccupationDto
    {
        /// <summary>
        /// Identifiant de l'équipe.
        /// </summary>
        public string? EquipeId { get; set; }

        /// <summary>
        /// Nom de l'équipe.
        /// </summary>
        public string? NomEquipe { get; set; }

        /// <summary>
        /// Nombre de créneaux avec effectif minimum atteint.
        /// </summary>
        public int CreneauxConformes { get; set; }

        /// <summary>
        /// Nombre total de créneaux.
        /// </summary>
        public int TotalCreneaux { get; set; }

        /// <summary>
        /// Taux (0-100).
        /// </summary>
        public double Taux { get; set; }
    }
}
