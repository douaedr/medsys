using MongoDB.Driver;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Exceptions;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    public class PlanningService : IPlanningService
    {
        private readonly IPlanningRepository _planningRepository;
        private readonly ICreneauRepository _creneauRepository;
        private readonly IEquipeRepository _equipeRepository;
        private readonly IPersonnelRepository _personnelRepository;

        public PlanningService(IPlanningRepository planningRepo, ICreneauRepository creneauRepo, IEquipeRepository equipeRepo, IPersonnelRepository personnelRepository)
        {
            _planningRepository = planningRepo;
            _creneauRepository = creneauRepo;
            _equipeRepository = equipeRepo;
            _personnelRepository = personnelRepository;
        }

        public async Task<List<PlanningDto>> ObtenirTousAsync()
        {
            var list = await _planningRepository.ObtenirTousAsync();
            return list.ConvertAll(PlanningMapper.VersDto);
        }

        public async Task<PageResult<PlanningDto>> ObtenirPageAsync(int page = 1, int taillePage = 20, string? trierPar = null, string? ordreTri = null, string? equipeId = null, StatutPlanning? statut = null)
        {
            var filtre = Builders<Planning>.Filter.Empty;
            if (!string.IsNullOrEmpty(equipeId))
                filtre = Builders<Planning>.Filter.Eq(p => p.EquipeId, equipeId);
            if (statut.HasValue)
                filtre &= Builders<Planning>.Filter.Eq(p => p.Statut, statut.Value);
            var tri = ConstruireTriPlanning(trierPar, ordreTri);
            var (items, total) = await _planningRepository.ObtenirPageAsync(filtre, tri, page, taillePage);
            return new PageResult<PlanningDto>
            {
                Items = items.ConvertAll(PlanningMapper.VersDto),
                Page = page,
                TaillePage = taillePage,
                Total = total
            };
        }

        private static SortDefinition<Planning>? ConstruireTriPlanning(string? trierPar, string? ordreTri)
        {
            var desc = string.Equals(ordreTri, "desc", StringComparison.OrdinalIgnoreCase);
            return (trierPar?.ToLowerInvariant()) switch
            {
                "nom" => desc ? Builders<Planning>.Sort.Descending(p => p.Nom) : Builders<Planning>.Sort.Ascending(p => p.Nom),
                "dateDebut" => desc ? Builders<Planning>.Sort.Descending(p => p.DateDebut) : Builders<Planning>.Sort.Ascending(p => p.DateDebut),
                "dateFin" => desc ? Builders<Planning>.Sort.Descending(p => p.DateFin) : Builders<Planning>.Sort.Ascending(p => p.DateFin),
                "statut" => desc ? Builders<Planning>.Sort.Descending(p => p.Statut) : Builders<Planning>.Sort.Ascending(p => p.Statut),
                _ => null
            };
        }

        public async Task<PlanningDto> ObtenirParIdAsync(string id)
        {
            var entite = await _planningRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Planning introuvable.");
            return PlanningMapper.VersDto(entite);
        }

        public async Task<PlanningDto> CreerAsync(PlanningCreateDto dto)
        {
            if (dto.DateFin <= dto.DateDebut)
                throw new RegleMetierException("La date de fin doit être postérieure à la date de début.");

            var entite = PlanningMapper.VersEntite(dto);
            await _planningRepository.CreerAsync(entite);
            return PlanningMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, PlanningUpdateDto dto)
        {
            var existante = await _planningRepository.ObtenirParIdAsync(id);
            if (existante == null)
                throw new KeyNotFoundException("Planning introuvable.");

            if (existante.Statut == StatutPlanning.PUBLIE || existante.Statut == StatutPlanning.ARCHIVE)
                throw new TransitionNonAutoriseeException("Un planning publié ou archivé ne peut plus être modifié.");

            if (dto.DateFin <= dto.DateDebut)
                throw new RegleMetierException("La date de fin doit être postérieure à la date de début.");

            PlanningMapper.MettreAJourEntite(dto, existante);
            await _planningRepository.MettreAJourAsync(id, existante);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _planningRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Planning introuvable.");
            await _planningRepository.SupprimerAsync(id);
        }

        public async Task MettreEnValidationAsync(string id, string utilisateurId)
        {
            var entite = await _planningRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Planning introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (entite.Statut != StatutPlanning.BROUILLON)
                throw new TransitionNonAutoriseeException("Seul un planning en brouillon peut être mis en validation.");

            entite.Statut = StatutPlanning.EN_VALIDATION;
            await _planningRepository.MettreAJourAsync(id, entite);
        }

        public async Task ValiderAsync(string id, string utilisateurId)
        {
            var entite = await _planningRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Planning introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (entite.Statut != StatutPlanning.EN_VALIDATION)
                throw new TransitionNonAutoriseeException("Seul un planning en validation peut être validé.");

            entite.Statut = StatutPlanning.VALIDE;
            await _planningRepository.MettreAJourAsync(id, entite);
        }

        public async Task PublierAsync(string id, string utilisateurId)
        {
            var entite = await _planningRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Planning introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (entite.Statut != StatutPlanning.VALIDE)
                throw new TransitionNonAutoriseeException("Seul un planning validé peut être publié.");

            var couvertureOk = await VerifierCouvertureAsync(id);
            if (!couvertureOk)
                throw new CouvertureInsuffisanteException("La couverture de l'effectif minimum n'est pas assurée pour tous les créneaux du planning.");

            entite.Statut = StatutPlanning.PUBLIE;
            await _planningRepository.MettreAJourAsync(id, entite);
        }

        public async Task ArchiverAsync(string id, string utilisateurId)
        {
            var entite = await _planningRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Planning introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (entite.Statut != StatutPlanning.PUBLIE && entite.Statut != StatutPlanning.VALIDE)
                throw new TransitionNonAutoriseeException("Seuls les plannings validés ou publiés peuvent être archivés.");

            entite.Statut = StatutPlanning.ARCHIVE;
            await _planningRepository.MettreAJourAsync(id, entite);
        }

        public async Task<bool> DetecterConflitsAsync(string planningId)
        {
            var creneaux = await _creneauRepository.ObtenirCreneauxParPlanningId(planningId);
            // group by personnel and check overlappings
            foreach (var groupe in creneaux.SelectMany(c => c.PersonnelIds.Select(pid => new { pid, c }))
                                           .GroupBy(x => x.pid))
            {
                var sorted = groupe.Select(x => x.c).OrderBy(c => c.Debut).ToList();
                for (int i = 1; i < sorted.Count; i++)
                {
                    if (sorted[i].Debut < sorted[i - 1].Fin)
                        return true;
                }
            }
            return false;
        }

        public async Task<bool> VerifierCouvertureAsync(string planningId)
        {
            var planning = await _planningRepository.ObtenirParIdAsync(planningId);
            if (planning == null)
                throw new KeyNotFoundException("Planning introuvable.");
            var equipe = await _equipeRepository.ObtenirParIdAsync(planning.EquipeId);
            if (equipe == null)
                throw new InvalidOperationException("Équipe associée introuvable.");

            var creneaux = await _creneauRepository.ObtenirCreneauxParPlanningId(planningId);
            foreach (var c in creneaux)
            {
                if (c.PersonnelIds.Count < equipe.EffectifMinimum)
                    return false;
            }
            return true;
        }

        private async Task VerifierUtilisateurGestionnaire(string utilisateurId)
        {
            var utilisateur = await _personnelRepository.ObtenirParIdAsync(utilisateurId);
            if (utilisateur is not ChefDeService && utilisateur is not Directeur)
            {
                throw new HabilitationException("Seul un chef de service ou un directeur peut modifier l'état d'un planning.");
            }
        }
    }
}