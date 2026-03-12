using System.Collections.Generic;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour la répartition des personnels par statut.
    /// </summary>
    public class RepartitionStatutDto
    {
        /// <summary>
        /// Dictionnaire statut → nombre.
        /// </summary>
        public Dictionary<string, int> ParStatut { get; set; } = new Dictionary<string, int>();
    }
}
