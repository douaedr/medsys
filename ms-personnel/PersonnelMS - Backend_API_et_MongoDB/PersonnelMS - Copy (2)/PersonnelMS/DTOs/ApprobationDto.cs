using System.ComponentModel.DataAnnotations;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour approuver ou refuser une demande (absence ou modification).
    /// </summary>
    public class ApprobationDto
    {
        /// <summary>
        /// Indique si la demande est approuvée (true) ou rejetée (false).
        /// </summary>
        public bool Approuve { get; set; }

        /// <summary>
        /// Commentaire optionnel associé à la décision.
        /// </summary>
        public string? Commentaire { get; set; }

        /// <summary>
        /// Identifiant de la personne qui effectue l'action (chef de service ou directeur).
        /// </summary>
        [Required]
        public string ValideurId { get; set; } = default!;
    }
}

