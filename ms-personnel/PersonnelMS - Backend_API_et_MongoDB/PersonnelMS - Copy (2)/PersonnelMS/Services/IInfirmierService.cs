using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface IInfirmierService
    {
        Task<List<InfirmierDto>> ObtenirTousInfirmiersAsync();
        Task<InfirmierDto> ObtenirInfirmierParIdAsync(string id);
        Task<InfirmierDto> CreerInfirmierAsync(InfirmierCreateDto dto);
        Task MettreAJourInfirmierAsync(string id, InfirmierUpdateDto dto);
        Task SupprimerInfirmierAsync(string id);
    }
}