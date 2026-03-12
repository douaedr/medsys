using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface IBrancardierService
    {
        Task<List<BrancardierDto>> ObtenirTousBrancardiersAsync();
        Task<BrancardierDto> ObtenirBrancardierParIdAsync(string id);
        Task<BrancardierDto> CreerBrancardierAsync(BrancardierCreateDto dto);
        Task MettreAJourBrancardierAsync(string id, BrancardierUpdateDto dto);
        Task SupprimerBrancardierAsync(string id);
    }
}