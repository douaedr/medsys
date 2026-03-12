using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class DirecteurService : IDirecteurService
    {
        private readonly IPersonnelRepository _repository;
        public DirecteurService(IPersonnelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<DirecteurDto>> ObtenirTousDirecteursAsync()
        {
            var liste = await _repository.ObtenirParTypeAsync<Directeur>();
            var result = new List<DirecteurDto>();
            foreach (var e in liste)
            {
                result.Add((DirecteurDto)PersonnelMapper.VersDto(e));
            }
            return result;
        }

        public async Task<DirecteurDto> ObtenirDirecteurParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null || !(entite is Directeur dir))
                throw new KeyNotFoundException("Directeur introuvable.");
            return (DirecteurDto)PersonnelMapper.VersDto(dir);
        }

        public async Task<DirecteurDto> CreerDirecteurAsync(DirecteurCreateDto dto)
        {
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
                throw new System.InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
                throw new System.InvalidOperationException("Un personnel avec ce matricule existe déjà.");

            var entite = DirecteurMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            return (DirecteurDto)PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourDirecteurAsync(string id, DirecteurUpdateDto dto)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Directeur dir))
                throw new KeyNotFoundException("Directeur introuvable.");
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce courriel.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce matricule.");

            DirecteurMapper.MettreAJourEntite(dto, dir);
            await _repository.MettreAJourAsync(id, dir);
        }

        public async Task SupprimerDirecteurAsync(string id)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Directeur))
                throw new KeyNotFoundException("Directeur introuvable.");
            await _repository.SupprimerAsync(id);
        }
    }
}