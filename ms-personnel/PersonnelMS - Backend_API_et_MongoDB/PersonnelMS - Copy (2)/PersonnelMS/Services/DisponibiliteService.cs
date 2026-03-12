using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Mappers;
using PersonnelMS.Models;
using PersonnelMS.Repositories;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Implémentation du service métier pour les disponibilités du personnel.
    /// </summary>
    public class DisponibiliteService : IDisponibiliteService
    {
        private readonly IDisponibiliteRepository _disponibiliteRepository;
        private readonly IPersonnelRepository _personnelRepository;

        public DisponibiliteService(IDisponibiliteRepository disponibiliteRepository, IPersonnelRepository personnelRepository)
        {
            _disponibiliteRepository = disponibiliteRepository;
            _personnelRepository = personnelRepository;
        }

        public async Task<List<DisponibiliteDto>> ObtenirTousAsync()
        {
            var liste = await _disponibiliteRepository.ObtenirTousAsync();
            return liste.ConvertAll(DisponibiliteMapper.VersDto);
        }

        public async Task<DisponibiliteDto> ObtenirParIdAsync(string id)
        {
            var entite = await _disponibiliteRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Disponibilité introuvable.");
            }

            return DisponibiliteMapper.VersDto(entite);
        }

        public async Task<List<DisponibiliteDto>> ObtenirParPersonnelIdAsync(string personnelId)
        {
            var liste = await _disponibiliteRepository.ObtenirParPersonnelIdAsync(personnelId);
            return liste.ConvertAll(DisponibiliteMapper.VersDto);
        }

        public async Task<DisponibiliteDto> CreerAsync(DisponibiliteCreateDto dto)
        {
            await VerifierPersonnelExiste(dto.PersonnelId);
            VerifierReglesTemps(dto.HeureDebut, dto.HeureFin);

            var chevauchement = await _disponibiliteRepository.ExisteChevauchementAsync(dto.PersonnelId, dto.Jour, dto.HeureDebut, dto.HeureFin);
            if (chevauchement)
            {
                throw new InvalidOperationException("Une autre disponibilité chevauche ce créneau pour ce jour.");
            }

            var entite = DisponibiliteMapper.VersEntite(dto);
            await _disponibiliteRepository.CreerAsync(entite);
            return DisponibiliteMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, DisponibiliteUpdateDto dto)
        {
            var existante = await _disponibiliteRepository.ObtenirParIdAsync(id);
            if (existante == null)
            {
                throw new KeyNotFoundException("Disponibilité introuvable.");
            }

            await VerifierPersonnelExiste(dto.PersonnelId);
            VerifierReglesTemps(dto.HeureDebut, dto.HeureFin);

            var chevauchement = await _disponibiliteRepository.ExisteChevauchementAsync(dto.PersonnelId, dto.Jour, dto.HeureDebut, dto.HeureFin, id);
            if (chevauchement)
            {
                throw new InvalidOperationException("Une autre disponibilité chevauche ce créneau pour ce jour.");
            }

            DisponibiliteMapper.MettreAJourEntite(dto, existante);
            await _disponibiliteRepository.MettreAJourAsync(id, existante);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _disponibiliteRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Disponibilité introuvable.");
            }

            await _disponibiliteRepository.SupprimerAsync(id);
        }

        private static void VerifierReglesTemps(TimeSpan debut, TimeSpan fin)
        {
            if (fin <= debut)
            {
                throw new InvalidOperationException("L'heure de fin doit être postérieure à l'heure de début.");
            }

            var duree = fin - debut;
            if (duree.TotalMinutes < 30)
            {
                throw new InvalidOperationException("La durée minimale d'une disponibilité est de 30 minutes.");
            }
        }

        private async Task VerifierPersonnelExiste(string personnelId)
        {
            var personnel = await _personnelRepository.ObtenirParIdAsync(personnelId);
            if (personnel == null)
            {
                throw new KeyNotFoundException("Personnel associé à la disponibilité introuvable.");
            }
        }
    }
}

