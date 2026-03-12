using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class InfirmierService : IInfirmierService
    {
        private readonly IPersonnelRepository _repository;

        public InfirmierService(IPersonnelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<InfirmierDto>> ObtenirTousInfirmiersAsync()
        {
            var liste = await _repository.ObtenirParTypeAsync<Infirmier>();
            var result = new List<InfirmierDto>();
            foreach (var inf in liste)
            {
                result.Add((InfirmierDto)PersonnelMapper.VersDto(inf));
            }
            return result;
        }

        public async Task<InfirmierDto> ObtenirInfirmierParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null || !(entite is Infirmier inf))
                throw new KeyNotFoundException("Infirmier introuvable.");
            return (InfirmierDto)PersonnelMapper.VersDto(inf);
        }

        public async Task<InfirmierDto> CreerInfirmierAsync(InfirmierCreateDto dto)
        {
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
                throw new System.InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
                throw new System.InvalidOperationException("Un personnel avec ce matricule existe déjà.");

            var entite = InfirmierMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            return (InfirmierDto)PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourInfirmierAsync(string id, InfirmierUpdateDto dto)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Infirmier inf))
                throw new KeyNotFoundException("Infirmier introuvable.");
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce courriel.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce matricule.");

            InfirmierMapper.MettreAJourEntite(dto, inf);
            await _repository.MettreAJourAsync(id, inf);
        }

        public async Task SupprimerInfirmierAsync(string id)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Infirmier))
                throw new KeyNotFoundException("Infirmier introuvable.");
            await _repository.SupprimerAsync(id);
        }
    }
}