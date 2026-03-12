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
    public class CreneauService : ICreneauService
    {
        private readonly ICreneauRepository _creneauRepository;
        private readonly IPersonnelRepository _personnelRepository;

        public CreneauService(ICreneauRepository creneauRepository, IPersonnelRepository personnelRepository)
        {
            _creneauRepository = creneauRepository;
            _personnelRepository = personnelRepository;
        }

        public async Task<List<CreneauDto>> ObtenirTousAsync()
        {
            var list = await _creneauRepository.ObtenirTousAsync();
            return list.ConvertAll(CreneauMapper.VersDto);
        }

        public async Task<CreneauDto> ObtenirParIdAsync(string id)
        {
            var entite = await _creneauRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Créneau introuvable.");
            return CreneauMapper.VersDto(entite);
        }

        public async Task<CreneauDto> CreerAsync(CreneauCreateDto dto)
        {
            VerifierReglesTemps(dto.Debut, dto.Fin);

            var entite = CreneauMapper.VersEntite(dto);

            if (entite.PersonnelIds != null && entite.PersonnelIds.Count > 0)
            {
                foreach (var personnelId in entite.PersonnelIds.Distinct())
                {
                    if (await VerifierChevauchementAsync(personnelId, entite.Debut, entite.Fin))
                    {
                        throw new ChevauchementException("Le personnel est déjà affecté sur un autre créneau pendant cette période.");
                    }
                }
            }

            await _creneauRepository.CreerAsync(entite);
            return CreneauMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, CreneauUpdateDto dto)
        {
            var existante = await _creneauRepository.ObtenirParIdAsync(id);
            if (existante == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            VerifierReglesTemps(dto.Debut, dto.Fin);

            var personnelsAControler = new HashSet<string>(existante.PersonnelIds);
            if (dto.PersonnelIds != null)
            {
                foreach (var pid in dto.PersonnelIds)
                {
                    personnelsAControler.Add(pid);
                }
            }

            foreach (var personnelId in personnelsAControler)
            {
                if (await VerifierChevauchementAsync(personnelId, dto.Debut, dto.Fin, id))
                {
                    throw new ChevauchementException("Le personnel est déjà affecté sur un autre créneau pendant cette période.");
                }
            }

            CreneauMapper.MettreAJourEntite(dto, existante);
            await _creneauRepository.MettreAJourAsync(id, existante);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _creneauRepository.ObtenirParIdAsync(id);
            if (entite == null)
                throw new KeyNotFoundException("Créneau introuvable.");
            await _creneauRepository.SupprimerAsync(id);
        }

        public async Task AffecterPersonnelAsync(string creneauId, string personnelId, string utilisateurId)
        {
            var creneau = await _creneauRepository.ObtenirParIdAsync(creneauId);
            if (creneau == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (await VerifierChevauchementAsync(personnelId, creneau.Debut, creneau.Fin, creneauId))
                throw new ChevauchementException("Le personnel est déjà affecté sur cette période.");

            if (!creneau.PersonnelIds.Contains(personnelId))
            {
                creneau.PersonnelIds.Add(personnelId);
                await _creneauRepository.MettreAJourAsync(creneauId, creneau);
            }
        }

        public async Task RetirerPersonnelAsync(string creneauId, string personnelId, string utilisateurId)
        {
            var creneau = await _creneauRepository.ObtenirParIdAsync(creneauId);
            if (creneau == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (creneau.PersonnelIds.Remove(personnelId))
            {
                await _creneauRepository.MettreAJourAsync(creneauId, creneau);
            }
        }

        public async Task<bool> VerifierChevauchementAsync(string personnelId, DateTime debut, DateTime fin, string? ignoreCreneauId = null)
        {
            var chevauchements = await _creneauRepository.ObtenirCreneauxParPersonnelEtPeriode(personnelId, debut, fin);
            return chevauchements.Any(c => c.Id != ignoreCreneauId);
        }

        public async Task ConfirmerAsync(string id, string utilisateurId)
        {
            var creneau = await _creneauRepository.ObtenirParIdAsync(id);
            if (creneau == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (creneau.Statut != StatutCreneau.PREVISIONNEL)
                throw new TransitionNonAutoriseeException("Seul un créneau prévisionnel peut être confirmé.");

            creneau.Statut = StatutCreneau.CONFIRME;
            await _creneauRepository.MettreAJourAsync(id, creneau);
        }

        public async Task CommencerAsync(string id, string utilisateurId)
        {
            var creneau = await _creneauRepository.ObtenirParIdAsync(id);
            if (creneau == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (creneau.Statut != StatutCreneau.CONFIRME)
                throw new TransitionNonAutoriseeException("Seul un créneau confirmé peut être démarré.");

            creneau.Statut = StatutCreneau.EN_COURS;
            await _creneauRepository.MettreAJourAsync(id, creneau);
        }

        public async Task TerminerAsync(string id, string utilisateurId)
        {
            var creneau = await _creneauRepository.ObtenirParIdAsync(id);
            if (creneau == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (creneau.Statut != StatutCreneau.EN_COURS)
                throw new TransitionNonAutoriseeException("Seul un créneau en cours peut être terminé.");

            creneau.Statut = StatutCreneau.TERMINE;
            await _creneauRepository.MettreAJourAsync(id, creneau);
        }

        public async Task AnnulerAsync(string id, string utilisateurId)
        {
            var creneau = await _creneauRepository.ObtenirParIdAsync(id);
            if (creneau == null)
                throw new KeyNotFoundException("Créneau introuvable.");

            await VerifierUtilisateurGestionnaire(utilisateurId);

            if (creneau.Statut == StatutCreneau.TERMINE)
                throw new TransitionNonAutoriseeException("Un créneau terminé ne peut pas être annulé.");

            creneau.Statut = StatutCreneau.ANNULE;
            await _creneauRepository.MettreAJourAsync(id, creneau);
        }

        private static void VerifierReglesTemps(DateTime debut, DateTime fin)
        {
            if (fin <= debut)
                throw new RegleMetierException("La fin du créneau doit être postérieure au début.");

            var duree = fin - debut;
            if (duree < TimeSpan.FromMinutes(15) || duree > TimeSpan.FromHours(12))
                throw new RegleMetierException("La durée du créneau doit être comprise entre 15 minutes et 12 heures.");
        }

        private async Task VerifierUtilisateurGestionnaire(string utilisateurId)
        {
            var utilisateur = await _personnelRepository.ObtenirParIdAsync(utilisateurId);
            if (utilisateur is not ChefDeService && utilisateur is not Directeur)
            {
                throw new HabilitationException("Seul un chef de service ou un directeur peut gérer les créneaux.");
            }
        }
    }
}