using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Interface du service métier pour le personnel.
    /// </summary>
    public interface IServicePersonnel
    {
        Task<List<PersonnelDto>> ObtenirTousAsync();
        /// <summary>
        /// Liste paginée avec tri et filtre optionnels.
        /// </summary>
        Task<PageResult<PersonnelDto>> ObtenirPageAsync(int page = 1, int taillePage = 20, string? trierPar = null, string? ordreTri = null, Statut? statut = null);
        Task<PersonnelDto> ObtenirParIdAsync(string id);
        Task<PersonnelDto> CreerAsync(PersonnelCreateDto dto);
        Task MettreAJourAsync(string id, PersonnelUpdateDto dto);
        Task SupprimerAsync(string id);
    }
}