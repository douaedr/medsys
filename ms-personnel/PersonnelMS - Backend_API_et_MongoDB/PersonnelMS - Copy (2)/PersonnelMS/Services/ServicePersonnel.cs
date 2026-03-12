using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;

namespace PersonnelMS.Services
{
    public class ServicePersonnel : IServicePersonnel
    {
        private readonly IPersonnelRepository _repository;
        private readonly ILogger<ServicePersonnel> _logger;

        public ServicePersonnel(IPersonnelRepository repository, ILogger<ServicePersonnel> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<List<PersonnelDto>> ObtenirTousAsync()
        {
            var liste = await _repository.ObtenirTousAsync();
            return liste.ConvertAll(PersonnelMapper.VersDto);
        }

        public async Task<PageResult<PersonnelDto>> ObtenirPageAsync(int page = 1, int taillePage = 20, string? trierPar = null, string? ordreTri = null, Statut? statut = null)
        {
            var filtre = Builders<Personnel>.Filter.Empty;
            if (statut.HasValue)
                filtre = Builders<Personnel>.Filter.Eq(p => p.Statut, statut.Value);
            var tri = ConstruireTriPersonnel(trierPar, ordreTri);
            var (items, total) = await _repository.ObtenirPageAsync(filtre, tri, page, taillePage);
            return new PageResult<PersonnelDto>
            {
                Items = items.ConvertAll(PersonnelMapper.VersDto),
                Page = page,
                TaillePage = taillePage,
                Total = total
            };
        }

        private static SortDefinition<Personnel>? ConstruireTriPersonnel(string? trierPar, string? ordreTri)
        {
            var desc = string.Equals(ordreTri, "desc", StringComparison.OrdinalIgnoreCase);
            return (trierPar?.ToLowerInvariant()) switch
            {
                "nom" => desc ? Builders<Personnel>.Sort.Descending(p => p.Nom) : Builders<Personnel>.Sort.Ascending(p => p.Nom),
                "prenom" => desc ? Builders<Personnel>.Sort.Descending(p => p.Prenom) : Builders<Personnel>.Sort.Ascending(p => p.Prenom),
                "courriel" => desc ? Builders<Personnel>.Sort.Descending(p => p.Courriel) : Builders<Personnel>.Sort.Ascending(p => p.Courriel),
                "matricule" => desc ? Builders<Personnel>.Sort.Descending(p => p.Matricule) : Builders<Personnel>.Sort.Ascending(p => p.Matricule),
                "statut" => desc ? Builders<Personnel>.Sort.Descending(p => p.Statut) : Builders<Personnel>.Sort.Ascending(p => p.Statut),
                "dateEmbauche" => desc ? Builders<Personnel>.Sort.Descending(p => p.DateEmbauche) : Builders<Personnel>.Sort.Ascending(p => p.DateEmbauche),
                "poste" => desc ? Builders<Personnel>.Sort.Descending(p => p.Poste) : Builders<Personnel>.Sort.Ascending(p => p.Poste),
                _ => null
            };
        }

        public async Task<PersonnelDto> ObtenirParIdAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Personnel introuvable.");
            }
            return PersonnelMapper.VersDto(entite);
        }

        public async Task<PersonnelDto> CreerAsync(PersonnelCreateDto dto)
        {
            // vérifications d'unicité
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel))
            {
                throw new InvalidOperationException("Un personnel avec ce courriel existe déjà.");
            }
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule))
            {
                throw new InvalidOperationException("Un personnel avec ce matricule existe déjà.");
            }

            var entite = PersonnelMapper.VersEntite(dto);
            await _repository.CreerAsync(entite);
            _logger.LogInformation("Personnel créé : {Matricule}, Id={Id}", entite.Matricule, entite.Id);
            return PersonnelMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, PersonnelUpdateDto dto)
        {
            var entiteExistante = await _repository.ObtenirParIdAsync(id);
            if (entiteExistante == null)
            {
                throw new KeyNotFoundException("Personnel introuvable.");
            }

            // vérifications d'unicité en excluant l'élément actuel
            if (await _repository.ExisteAsync(p => p.Courriel == dto.Courriel && p.Id != id))
            {
                throw new InvalidOperationException("Un autre personnel utilise ce courriel.");
            }
            if (await _repository.ExisteAsync(p => p.Matricule == dto.Matricule && p.Id != id))
            {
                throw new InvalidOperationException("Un autre personnel utilise ce matricule.");
            }

            PersonnelMapper.MettreAJourEntite(dto, entiteExistante);
            await _repository.MettreAJourAsync(id, entiteExistante);
            _logger.LogInformation("Personnel mis à jour : Id={Id}", id);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _repository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Personnel introuvable.");
            }
            await _repository.SupprimerAsync(id);
            _logger.LogInformation("Personnel supprimé : Id={Id}", id);
        }
    }
}