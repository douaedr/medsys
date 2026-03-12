using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class MedecinService : IMedecinService
    {
        private readonly IPersonnelRepository _repository;

        public MedecinService(IPersonnelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<MedecinDto>> ObtenirTousMedecinsAsync()
        {
            var liste = await _repository.ObtenirParTypeAsync<Medecin>();
            var result = new List<MedecinDto>();
            foreach (var med in liste)
            {
                result.Add((MedecinDto)PersonnelMapper.VersDto(med));
            }
            return result;
        }

        public async Task<MedecinDto> ObtenirMedecinParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null || !(entite is Medecin med))
                throw new KeyNotFoundException("Médecin introuvable.");
            return (MedecinDto)PersonnelMapper.VersDto(med);
        }

        public async Task<MedecinDto> CreerMedecinAsync(MedecinCreateDto dto)
        {
            // vérifier l'unicité du courriel/matricule comme pour le personnel
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
                throw new InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
                throw new InvalidOperationException("Un personnel avec ce matricule existe déjà.");

            // validations spécifiques en fonction du type
            switch (dto.Type)
            {
                case Enums.TypeMedecin.Junior:
                    if (string.IsNullOrEmpty(dto.Promotion) || string.IsNullOrEmpty(dto.NiveauFormation))
                        throw new InvalidOperationException("Promotion et NiveauFormation sont requis pour un médecin junior.");
                    break;
                case Enums.TypeMedecin.ChefDeService:
                    if (string.IsNullOrEmpty(dto.ServiceNom))
                        throw new InvalidOperationException("ServiceNom est requis pour un chef de service.");
                    break;
            }

            // numéro d'ordre unique parmi les médecins
            if (!string.IsNullOrEmpty(dto.NumeroOrdre))
            {
                var medExistants = await _repository.ObtenirParTypeAsync<Medecin>();
                if (medExistants.Exists(m => m.NumeroOrdre == dto.NumeroOrdre))
                {
                    throw new InvalidOperationException("Un médecin avec ce numéro d'ordre existe déjà.");
                }
            }

            var entite = MedecinMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            return (MedecinDto)PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourMedecinAsync(string id, MedecinUpdateDto dto)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Medecin med))
                throw new KeyNotFoundException("Médecin introuvable.");

            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
                throw new InvalidOperationException("Un autre personnel utilise ce courriel.");
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
                throw new InvalidOperationException("Un autre personnel utilise ce matricule.");
            if (!string.IsNullOrEmpty(dto.NumeroOrdre))
            {
                var medExistants = await _repository.ObtenirParTypeAsync<Medecin>();
                if (medExistants.Exists(m => m.NumeroOrdre == dto.NumeroOrdre && m.Id != id))
                {
                    throw new InvalidOperationException("Un autre médecin utilise ce numéro d'ordre.");
                }
            }

            // validations de champs selon type
            switch (dto.Type)
            {
                case Enums.TypeMedecin.Junior:
                    if (string.IsNullOrEmpty(dto.Promotion) || string.IsNullOrEmpty(dto.NiveauFormation))
                        throw new InvalidOperationException("Promotion et NiveauFormation sont requis pour un médecin junior.");
                    break;
                case Enums.TypeMedecin.ChefDeService:
                    if (string.IsNullOrEmpty(dto.ServiceNom))
                        throw new InvalidOperationException("ServiceNom est requis pour un chef de service.");
                    break;
            }

            MedecinMapper.MettreAJourEntite(dto, med);
            await _repository.MettreAJourAsync(id, med);
        }

        public async Task SupprimerMedecinAsync(string id)
        {
            var existante = await _repository.ObtenirParIdAsync(id);
            if (existante == null || !(existante is Medecin))
                throw new KeyNotFoundException("Médecin introuvable.");
            await _repository.SupprimerAsync(id);
        }
    }
}