using System.ComponentModel.DataAnnotations;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour représenter une action effectuée par un utilisateur (simulation d'authentification).
    /// </summary>
    public class RequeteActionDto
    {
        /// <summary>
        /// Identifiant de l'utilisateur qui effectue l'action.
        /// </summary>
        [Required]
        public string UtilisateurId { get; set; } = default!;
    }
}

