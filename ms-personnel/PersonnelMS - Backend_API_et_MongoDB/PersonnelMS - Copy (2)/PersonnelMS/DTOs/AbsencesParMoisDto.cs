namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour le rapport des absences par mois et par type.
    /// </summary>
    public class AbsencesParMoisDto
    {
        /// <summary>
        /// Mois (1-12).
        /// </summary>
        public int Mois { get; set; }

        /// <summary>
        /// Type d'absence.
        /// </summary>
        public string Type { get; set; } = default!;

        /// <summary>
        /// Nombre total d'absences.
        /// </summary>
        public int Total { get; set; }
    }
}
