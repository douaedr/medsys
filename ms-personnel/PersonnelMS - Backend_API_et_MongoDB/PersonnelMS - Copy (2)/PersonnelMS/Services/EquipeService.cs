using MongoDB.Driver;
using PersonnelMS.DTOs;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class EquipeService : IEquipeService
    {
        private readonly IEquipeRepository _equipeRepository;
        private readonly IPersonnelRepository _personnelRepository;

        public EquipeService(IEquipeRepository equipeRepository, IPersonnelRepository personnelRepository)
        {
            _equipeRepository = equipeRepository;
            _personnelRepository = personnelRepository;
        }

        public async Task<List<EquipeDto>> ObtenirTousAsync()
        {
            var list = await _equipeRepository.ObtenirTousAsync();
            return list.ConvertAll(EquipeMapper.VersDto);
        }

        public async Task<PageResult<EquipeDto>> ObtenirPageAsync(int page = 1, int taillePage = 20, string? trierPar = null, string? ordreTri = null)
        {
            var tri = ConstruireTriEquipe(trierPar, ordreTri);
            var (items, total) = await _equipeRepository.ObtenirPageAsync(null, tri, page, taillePage);
            return new PageResult<EquipeDto>
            {
                Items = items.ConvertAll(EquipeMapper.VersDto),
                Page = page,
                TaillePage = taillePage,
                Total = total
            };
        }

        private static SortDefinition<Equipe>? ConstruireTriEquipe(string? trierPar, string? ordreTri)
        {
            var desc = string.Equals(ordreTri, "desc", StringComparison.OrdinalIgnoreCase);
            return (trierPar?.ToLowerInvariant()) switch
            {
                "nom" => desc ? Builders<Equipe>.Sort.Descending(e => e.Nom) : Builders<Equipe>.Sort.Ascending(e => e.Nom),
                "effectifCible" => desc ? Builders<Equipe>.Sort.Descending(e => e.EffectifCible) : Builders<Equipe>.Sort.Ascending(e => e.EffectifCible),
                "effectifMinimum" => desc ? Builders<Equipe>.Sort.Descending(e => e.EffectifMinimum) : Builders<Equipe>.Sort.Ascending(e => e.EffectifMinimum),
                _ => null
            };
        }

        public async Task<EquipeDto> ObtenirParIdAsync(string id)
        {
            var entite = await _equipeRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Équipe introuvable.");
            return EquipeMapper.VersDto(entite);
        }

        public async Task<EquipeDto> CreerAsync(EquipeCreateDto dto)
        {
            if (dto.EffectifMinimum > dto.EffectifCible)
                throw new InvalidOperationException("L'effectif minimum ne peut pas dépasser l'effectif cible.");

            await VerifierTypesPersonnelsAsync(dto.ChefEquipeId, dto.EncadrantId, dto.ChefDeServiceId);

            var entite = EquipeMapper.VersEntite(dto);
            await _equipeRepository.CreerAsync(entite);
            return EquipeMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, EquipeUpdateDto dto)
        {
            var existante = await _equipeRepository.ObtenirParIdAsync(id);
            if (existante == null)
                throw new KeyNotFoundException("Équipe introuvable.");

            if (dto.EffectifMinimum > dto.EffectifCible)
                throw new InvalidOperationException("L'effectif minimum ne peut pas dépasser l'effectif cible.");

            await VerifierTypesPersonnelsAsync(dto.ChefEquipeId, dto.EncadrantId, dto.ChefDeServiceId);

            EquipeMapper.MettreAJourEntite(dto, existante);
            await _equipeRepository.MettreAJourAsync(id, existante);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _equipeRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Équipe introuvable.");
            await _equipeRepository.SupprimerAsync(id);
        }

        public async Task AjouterMembreAsync(string equipeId, string personnelId)
        {
            var equipe = await _equipeRepository.ObtenirParIdAsync(equipeId);
            if (equipe == null)
                throw new KeyNotFoundException("Équipe introuvable.");

            var personnel = await _personnelRepository.ObtenirParIdAsync(personnelId);
            if (personnel == null)
                throw new KeyNotFoundException("Personnel introuvable.");

            if (!equipe.MembreIds.Contains(personnelId))
            {
                equipe.MembreIds.Add(personnelId);
                await _equipeRepository.MettreAJourAsync(equipeId, equipe);
            }
        }

        public async Task RetirerMembreAsync(string equipeId, string personnelId)
        {
            var equipe = await _equipeRepository.ObtenirParIdAsync(equipeId);
            if (equipe == null)
                throw new KeyNotFoundException("Équipe introuvable.");

            if (equipe.MembreIds.Remove(personnelId))
            {
                await _equipeRepository.MettreAJourAsync(equipeId, equipe);
            }
        }

        public async Task<bool> VerifierEffectifAsync(string equipeId)
        {
            var equipe = await _equipeRepository.ObtenirParIdAsync(equipeId);
            if (equipe == null)
                throw new KeyNotFoundException("Équipe introuvable.");

            return equipe.VerifierEffectif();
        }

        private async Task VerifierTypesPersonnelsAsync(string? chefId, string? encadrantId, string? chefDeServiceId)
        {
            if (!string.IsNullOrEmpty(chefId))
            {
                var chef = await _personnelRepository.ObtenirParIdAsync(chefId);
                if (chef == null || chef is not Models.InfirmierMajorant)
                    throw new InvalidOperationException("Le chef d'équipe doit être un infirmier majorant existant.");
            }

            if (!string.IsNullOrEmpty(encadrantId))
            {
                var enc = await _personnelRepository.ObtenirParIdAsync(encadrantId);
                if (enc == null || enc is not Models.Medecin)
                    throw new InvalidOperationException("L'encadrant doit être un médecin existant.");
                // vérification du type concret
                if (enc is Models.MedecinJunior)
                    throw new InvalidOperationException("L'encadrant ne peut pas être un médecin junior.");
            }

            if (!string.IsNullOrEmpty(chefDeServiceId))
            {
                var cds = await _personnelRepository.ObtenirParIdAsync(chefDeServiceId);
                if (cds == null || cds is not Models.ChefDeService)
                    throw new InvalidOperationException("Le chef de service doit être un ChefDeService existant.");
            }
        }
    }
}