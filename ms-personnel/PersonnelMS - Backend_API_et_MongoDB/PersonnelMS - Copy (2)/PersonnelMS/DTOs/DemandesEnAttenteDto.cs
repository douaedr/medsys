namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour le rapport des demandes en attente.
    /// </summary>
    public class DemandesEnAttenteDto
    {
        /// <summary>
        /// Nombre d'absences en attente de validation.
        /// </summary>
        public int AbsencesEnAttente { get; set; }

        /// <summary>
        /// Nombre de demandes de modification en attente.
        /// </summary>
        public int DemandesModificationEnAttente { get; set; }

        /// <summary>
        /// Total des demandes en attente.
        /// </summary>
        public int Total => AbsencesEnAttente + DemandesModificationEnAttente;
    }
}
