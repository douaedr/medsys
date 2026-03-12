using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Exceptions;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Implémentation du service métier pour les absences du personnel.
    /// </summary>
    public class AbsenceService : IAbsenceService
    {
        private readonly IAbsenceRepository _absenceRepository;
        private readonly IPersonnelRepository _personnelRepository;

        public AbsenceService(IAbsenceRepository absenceRepository, IPersonnelRepository personnelRepository)
        {
            _absenceRepository = absenceRepository;
            _personnelRepository = personnelRepository;
        }

        public async Task<List<AbsenceDto>> ObtenirTousAsync()
        {
            var liste = await _absenceRepository.ObtenirTousAsync();
            return liste.ConvertAll(AbsenceMapper.VersDto);
        }

        public async Task<AbsenceDto> ObtenirParIdAsync(string id)
        {
            var entite = await _absenceRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Absence introuvable.");
            }
            return AbsenceMapper.VersDto(entite);
        }

        public async Task<List<AbsenceDto>> ObtenirParPersonnelIdAsync(string personnelId)
        {
            var liste = await _absenceRepository.ObtenirParPersonnelIdAsync(personnelId);
            return liste.ConvertAll(AbsenceMapper.VersDto);
        }

        public async Task<List<AbsenceDto>> ObtenirEnAttenteAsync()
        {
            var liste = await _absenceRepository.ObtenirEnAttenteAsync();
            return liste.ConvertAll(AbsenceMapper.VersDto);
        }

        public async Task<AbsenceDto> CreerAsync(AbsenceCreateDto dto)
        {
            await VerifierPersonnelExiste(dto.PersonnelId);
            VerifierReglesDates(dto.DateDebut, dto.DateFin);

            var entite = AbsenceMapper.VersEntite(dto);
            await _absenceRepository.CreerAsync(entite);
            return AbsenceMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, AbsenceUpdateDto dto)
        {
            var existante = await _absenceRepository.ObtenirParIdAsync(id);
            if (existante == null)
            {
                throw new KeyNotFoundException("Absence introuvable.");
            }

            if (existante.Statut != StatutAbsence.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les absences en attente peuvent être modifiées.");
            }

            await VerifierPersonnelExiste(dto.PersonnelId);
            VerifierReglesDates(dto.DateDebut, dto.DateFin);

            AbsenceMapper.MettreAJourEntite(dto, existante);
            await _absenceRepository.MettreAJourAsync(id, existante);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _absenceRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Absence introuvable.");
            }

            // Pour ce sprint, on autorise la suppression uniquement si l'absence est en attente.
            if (entite.Statut != StatutAbsence.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les absences en attente peuvent être supprimées.");
            }

            await _absenceRepository.SupprimerAsync(id);
        }

        public async Task ApprouverAsync(string id, string valideurId, string? commentaire = null)
        {
            var entite = await _absenceRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Absence introuvable.");
            }

            if (entite.Statut != StatutAbsence.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les absences en attente peuvent être approuvées.");
            }

            await VerifierValideurAutorise(valideurId);
            entite.Statut = StatutAbsence.APPROUVEE;
            entite.ValideurId = valideurId;

            await _absenceRepository.MettreAJourAsync(id, entite);
        }

        public async Task RefuserAsync(string id, string valideurId, string? commentaire = null)
        {
            var entite = await _absenceRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Absence introuvable.");
            }

            if (entite.Statut != StatutAbsence.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les absences en attente peuvent être refusées.");
            }

            await VerifierValideurAutorise(valideurId);
            entite.Statut = StatutAbsence.REJETEE;
            entite.ValideurId = valideurId;

            await _absenceRepository.MettreAJourAsync(id, entite);
        }

        public async Task AnnulerAsync(string id, string demandeurId)
        {
            var entite = await _absenceRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Absence introuvable.");
            }

            if (entite.Statut != StatutAbsence.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les absences en attente peuvent être annulées.");
            }

            if (entite.PersonnelId != demandeurId)
            {
                throw new HabilitationException("Seul le demandeur peut annuler son absence.");
            }

            entite.Statut = StatutAbsence.ANNULEE;
            await _absenceRepository.MettreAJourAsync(id, entite);
        }

        private static void VerifierReglesDates(DateTime dateDebut, DateTime dateFin)
        {
            var aujourdHui = DateTime.UtcNow.Date;

            if (dateDebut.Date < aujourdHui)
            {
                throw new RegleMetierException("La date de début ne peut pas être dans le passé.");
            }

            if (dateFin.Date <= dateDebut.Date)
            {
                throw new RegleMetierException("La date de fin doit être postérieure à la date de début.");
            }
        }

        private async Task VerifierPersonnelExiste(string personnelId)
        {
            var personnel = await _personnelRepository.ObtenirParIdAsync(personnelId);
            if (personnel == null)
            {
                throw new KeyNotFoundException("Personnel associé à l'absence introuvable.");
            }
        }

        private async Task VerifierValideurAutorise(string valideurId)
        {
            var valideur = await _personnelRepository.ObtenirParIdAsync(valideurId);
            if (valideur is not ChefDeService && valideur is not Directeur)
            {
                throw new HabilitationException("Seul un chef de service ou directeur peut valider une absence.");
            }
        }
    }
}

