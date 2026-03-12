using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class BrancardierService : IBrancardierService
    {
        private readonly IPersonnelRepository _repository;
        public BrancardierService(IPersonnelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<BrancardierDto>> ObtenirTousBrancardiersAsync()
        {
            var liste = await _repository.ObtenirParTypeAsync<Brancardier>();
            var result = new List<BrancardierDto>();
            foreach (var e in liste)
            {
                result.Add((BrancardierDto)PersonnelMapper.VersDto(e));
            }
            return result;
        }

        public async Task<BrancardierDto> ObtenirBrancardierParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null || !(entite is Brancardier br))
                throw new KeyNotFoundException("Brancardier introuvable.");
            return (BrancardierDto)PersonnelMapper.VersDto(br);
        }

        public async Task<BrancardierDto> CreerBrancardierAsync(BrancardierCreateDto dto)
        {
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
                throw new System.InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
                throw new System.InvalidOperationException("Un personnel avec ce matricule existe déjà.");

            var entite = BrancardierMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            return (BrancardierDto)PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourBrancardierAsync(string id, BrancardierUpdateDto dto)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Brancardier br))
                throw new KeyNotFoundException("Brancardier introuvable.");
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce courriel.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce matricule.");

            BrancardierMapper.MettreAJourEntite(dto, br);
            await _repository.MettreAJourAsync(id, br);
        }

        public async Task SupprimerBrancardierAsync(string id)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Brancardier))
                throw new KeyNotFoundException("Brancardier introuvable.");
            await _repository.SupprimerAsync(id);
        }
    }
}