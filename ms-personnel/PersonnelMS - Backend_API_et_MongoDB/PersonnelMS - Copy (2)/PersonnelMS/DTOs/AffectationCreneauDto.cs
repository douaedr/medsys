using System.ComponentModel.DataAnnotations;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour affecter un membre du personnel à un créneau.
    /// </summary>
    public class AffectationCreneauDto
    {
        /// <summary>
        /// Identifiant du membre du personnel à affecter.
        /// </summary>
        [Required]
        public string PersonnelId { get; set; } = default!;

        /// <summary>
        /// Identifiant de l'utilisateur qui effectue l'affectation.
        /// </summary>
        [Required]
        public string UtilisateurId { get; set; } = default!;
    }
}

