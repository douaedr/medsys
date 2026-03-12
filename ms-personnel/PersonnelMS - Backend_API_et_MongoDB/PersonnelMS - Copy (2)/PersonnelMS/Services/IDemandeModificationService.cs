using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.DTOs;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Service métier pour la gestion des demandes de modification de planning.
    /// </summary>
    public interface IDemandeModificationService
    {
        Task<List<DemandeModificationDto>> ObtenirTousAsync();
        Task<DemandeModificationDto> ObtenirParIdAsync(string id);
        Task<List<DemandeModificationDto>> ObtenirParPersonnelIdAsync(string personnelId);
        Task<List<DemandeModificationDto>> ObtenirEnAttenteAsync();
        Task<DemandeModificationDto> CreerAsync(DemandeModificationCreateDto dto);
        Task MettreAJourAsync(string id, DemandeModificationUpdateDto dto);
        Task SupprimerAsync(string id);
        Task ApprouverAsync(string id, string traiteurId, string? commentaire = null);
        Task RejeterAsync(string id, string traiteurId, string? commentaire = null);
    }
}

