using PersonnelMS.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface ICreneauService
    {
        Task<List<CreneauDto>> ObtenirTousAsync();
        Task<CreneauDto> ObtenirParIdAsync(string id);
        Task<CreneauDto> CreerAsync(CreneauCreateDto dto);
        Task MettreAJourAsync(string id, CreneauUpdateDto dto);
        Task SupprimerAsync(string id);
        Task AffecterPersonnelAsync(string creneauId, string personnelId, string utilisateurId);
        Task RetirerPersonnelAsync(string creneauId, string personnelId, string utilisateurId);
        Task<bool> VerifierChevauchementAsync(string personnelId, DateTime debut, DateTime fin, string? ignoreCreneauId = null);
        Task ConfirmerAsync(string id, string utilisateurId);
        Task CommencerAsync(string id, string utilisateurId);
        Task TerminerAsync(string id, string utilisateurId);
        Task AnnulerAsync(string id, string utilisateurId);
    }
}