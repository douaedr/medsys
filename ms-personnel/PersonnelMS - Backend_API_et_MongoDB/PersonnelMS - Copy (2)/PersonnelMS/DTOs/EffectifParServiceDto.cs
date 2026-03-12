namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour le rapport d'effectif par service.
    /// </summary>
    public class EffectifParServiceDto
    {
        /// <summary>
        /// Nom du service.
        /// </summary>
        public string Service { get; set; } = default!;

        /// <summary>
        /// Nombre de personnels dans le service.
        /// </summary>
        public int Effectif { get; set; }
    }
}
