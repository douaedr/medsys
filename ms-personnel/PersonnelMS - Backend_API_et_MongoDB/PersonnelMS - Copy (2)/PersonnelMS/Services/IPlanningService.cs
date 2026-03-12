using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface IPlanningService
    {
        Task<List<PlanningDto>> ObtenirTousAsync();
        Task<PageResult<PlanningDto>> ObtenirPageAsync(int page = 1, int taillePage = 20, string? trierPar = null, string? ordreTri = null, string? equipeId = null, StatutPlanning? statut = null);
        Task<PlanningDto> ObtenirParIdAsync(string id);
        Task<PlanningDto> CreerAsync(PlanningCreateDto dto);
        Task MettreAJourAsync(string id, PlanningUpdateDto dto);
        Task SupprimerAsync(string id);
        Task MettreEnValidationAsync(string id, string utilisateurId);
        Task ValiderAsync(string id, string utilisateurId);
        Task PublierAsync(string id, string utilisateurId);
        Task ArchiverAsync(string id, string utilisateurId);
        Task<bool> DetecterConflitsAsync(string planningId);
        Task<bool> VerifierCouvertureAsync(string planningId);
    }
}