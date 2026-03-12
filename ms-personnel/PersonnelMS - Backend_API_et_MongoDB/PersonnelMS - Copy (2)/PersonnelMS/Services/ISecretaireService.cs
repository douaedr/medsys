using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public interface ISecretaireService
    {
        Task<List<SecretaireDto>> ObtenirToutesSecretairesAsync();
        Task<SecretaireDto> ObtenirSecretaireParIdAsync(string id);
        Task<SecretaireDto> CreerSecretaireAsync(SecretaireCreateDto dto);
        Task MettreAJourSecretaireAsync(string id, SecretaireUpdateDto dto);
        Task SupprimerSecretaireAsync(string id);
    }
}