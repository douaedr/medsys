using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface IAideSoignantService
    {
        Task<List<AideSoignantDto>> ObtenirTousAidesAsync();
        Task<AideSoignantDto> ObtenirAideParIdAsync(string id);
        Task<AideSoignantDto> CreerAideAsync(AideSoignantCreateDto dto);
        Task MettreAJourAideAsync(string id, AideSoignantUpdateDto dto);
        Task SupprimerAideAsync(string id);
    }
}