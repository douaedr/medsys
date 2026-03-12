using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface IEquipeService
    {
        Task<List<EquipeDto>> ObtenirTousAsync();
        Task<PageResult<EquipeDto>> ObtenirPageAsync(int page = 1, int taillePage = 20, string? trierPar = null, string? ordreTri = null);
        Task<EquipeDto> ObtenirParIdAsync(string id);
        Task<EquipeDto> CreerAsync(EquipeCreateDto dto);
        Task MettreAJourAsync(string id, EquipeUpdateDto dto);
        Task SupprimerAsync(string id);
        Task AjouterMembreAsync(string equipeId, string personnelId);
        Task RetirerMembreAsync(string equipeId, string personnelId);
        Task<bool> VerifierEffectifAsync(string equipeId);
    }
}