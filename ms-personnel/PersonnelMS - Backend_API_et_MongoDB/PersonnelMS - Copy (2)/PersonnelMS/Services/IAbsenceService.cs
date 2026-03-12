using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.DTOs;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Service métier pour la gestion des absences du personnel.
    /// </summary>
    public interface IAbsenceService
    {
        Task<List<AbsenceDto>> ObtenirTousAsync();
        Task<AbsenceDto> ObtenirParIdAsync(string id);
        Task<List<AbsenceDto>> ObtenirParPersonnelIdAsync(string personnelId);
        Task<List<AbsenceDto>> ObtenirEnAttenteAsync();
        Task<AbsenceDto> CreerAsync(AbsenceCreateDto dto);
        Task MettreAJourAsync(string id, AbsenceUpdateDto dto);
        Task SupprimerAsync(string id);
        Task ApprouverAsync(string id, string valideurId, string? commentaire = null);
        Task RefuserAsync(string id, string valideurId, string? commentaire = null);
        Task AnnulerAsync(string id, string demandeurId);
    }
}

