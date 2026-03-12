using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.DTOs;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Service métier pour la gestion des disponibilités du personnel.
    /// </summary>
    public interface IDisponibiliteService
    {
        Task<List<DisponibiliteDto>> ObtenirTousAsync();
        Task<DisponibiliteDto> ObtenirParIdAsync(string id);
        Task<List<DisponibiliteDto>> ObtenirParPersonnelIdAsync(string personnelId);
        Task<DisponibiliteDto> CreerAsync(DisponibiliteCreateDto dto);
        Task MettreAJourAsync(string id, DisponibiliteUpdateDto dto);
        Task SupprimerAsync(string id);
    }
}

