using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class SecretaireService : ISecretaireService
    {
        private readonly IPersonnelRepository _repository;
        public SecretaireService(IPersonnelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<SecretaireDto>> ObtenirToutesSecretairesAsync()
        {
            var liste = await _repository.ObtenirParTypeAsync<Secretaire>();
            var result = new List<SecretaireDto>();
            foreach (var s in liste)
            {
                result.Add((SecretaireDto)PersonnelMapper.VersDto(s));
            }
            return result;
        }

        public async Task<SecretaireDto> ObtenirSecretaireParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null || !(entite is Secretaire sec))
                throw new KeyNotFoundException("Secrétaire introuvable.");
            return (SecretaireDto)PersonnelMapper.VersDto(sec);
        }

        public async Task<SecretaireDto> CreerSecretaireAsync(SecretaireCreateDto dto)
        {
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
                throw new System.InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
                throw new System.InvalidOperationException("Un personnel avec ce matricule existe déjà.");

            var entite = SecretaireMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            return (SecretaireDto)PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourSecretaireAsync(string id, SecretaireUpdateDto dto)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Secretaire sec))
                throw new KeyNotFoundException("Secrétaire introuvable.");
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce courriel.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
                throw new System.InvalidOperationException("Un autre personnel utilise ce matricule.");

            SecretaireMapper.MettreAJourEntite(dto, sec);
            await _repository.MettreAJourAsync(id, sec);
        }

        public async Task SupprimerSecretaireAsync(string id)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Secretaire))
                throw new KeyNotFoundException("Secrétaire introuvable.");
            await _repository.SupprimerAsync(id);
        }
    }
}