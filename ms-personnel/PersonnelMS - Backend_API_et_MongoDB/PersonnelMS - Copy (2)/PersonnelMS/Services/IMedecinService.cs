using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Interface métier pour la gestion des médecins.
    /// </summary>
    public interface IMedecinService
    {
        Task<List<MedecinDto>> ObtenirTousMedecinsAsync();
        Task<MedecinDto> ObtenirMedecinParIdAsync(string id);
        Task<MedecinDto> CreerMedecinAsync(MedecinCreateDto dto);
        Task MettreAJourMedecinAsync(string id, MedecinUpdateDto dto);
        Task SupprimerMedecinAsync(string id);
    }
}