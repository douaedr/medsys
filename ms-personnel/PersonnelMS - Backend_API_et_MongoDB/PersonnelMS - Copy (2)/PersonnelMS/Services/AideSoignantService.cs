using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class AideSoignantService : IAideSoignantService
    {
        private readonly IPersonnelRepository _repository;
        public AideSoignantService(IPersonnelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<AideSoignantDto>> ObtenirTousAidesAsync()
        {
            var liste = await _repository.ObtenirParTypeAsync<AideSoignant>();
            var result = new List<AideSoignantDto>();
            foreach (var ent in liste)
            {
                result.Add((AideSoignantDto)PersonnelMapper.VersDto(ent));
            }
            return result;
        }

        public async Task<AideSoignantDto> ObtenirAideParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null || !(entite is AideSoignant aide))
                throw new KeyNotFoundException("Aide-soignant introuvable.");
            return (AideSoignantDto)PersonnelMapper.VersDto(aide);
        }

        public async Task<AideSoignantDto> CreerAideAsync(AideSoignantCreateDto dto)
        {
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
                throw new System.InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
                throw new System.InvalidOperationException("Un personnel avec ce matricule existe déjà.");

            var entite = AideSoignantMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            return (AideSoignantDto)PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourAideAsync(string id, AideSoignantUpdateDto dto)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is AideSoignant aide))
                throw new KeyNotFoundException("Aide-soignant introuvable.");
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce courriel.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce matricule.");

            AideSoignantMapper.MettreAJourEntite(dto, aide);
            await _repository.MettreAJourAsync(id, aide);
        }

        public async Task SupprimerAideAsync(string id)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is AideSoignant))
                throw new KeyNotFoundException("Aide-soignant introuvable.");
            await _repository.SupprimerAsync(id);
        }
    }
}