using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface IDirecteurService
    {
        Task<List<DirecteurDto>> ObtenirTousDirecteursAsync();
        Task<DirecteurDto> ObtenirDirecteurParIdAsync(string id);
        Task<DirecteurDto> CreerDirecteurAsync(DirecteurCreateDto dto);
        Task MettreAJourDirecteurAsync(string id, DirecteurUpdateDto dto);
        Task SupprimerDirecteurAsync(string id);
    }
}