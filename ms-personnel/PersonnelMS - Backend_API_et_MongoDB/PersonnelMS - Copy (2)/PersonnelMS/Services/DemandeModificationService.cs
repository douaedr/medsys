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
    /// Implémentation du service métier pour les demandes de modification de planning.
    /// </summary>
    public class DemandeModificationService : IDemandeModificationService
    {
        private readonly IDemandeModificationRepository _demandeRepository;
        private readonly IPersonnelRepository _personnelRepository;
        private readonly ICreneauRepository _creneauRepository;

        public DemandeModificationService(IDemandeModificationRepository demandeRepository, IPersonnelRepository personnelRepository, ICreneauRepository creneauRepository)
        {
            _demandeRepository = demandeRepository;
            _personnelRepository = personnelRepository;
            _creneauRepository = creneauRepository;
        }

        public async Task<List<DemandeModificationDto>> ObtenirTousAsync()
        {
            var liste = await _demandeRepository.ObtenirTousAsync();
            return liste.ConvertAll(DemandeModificationMapper.VersDto);
        }

        public async Task<DemandeModificationDto> ObtenirParIdAsync(string id)
        {
            var entite = await _demandeRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Demande de modification introuvable.");
            }

            return DemandeModificationMapper.VersDto(entite);
        }

        public async Task<List<DemandeModificationDto>> ObtenirParPersonnelIdAsync(string personnelId)
        {
            var liste = await _demandeRepository.ObtenirParPersonnelIdAsync(personnelId);
            return liste.ConvertAll(DemandeModificationMapper.VersDto);
        }

        public async Task<List<DemandeModificationDto>> ObtenirEnAttenteAsync()
        {
            var liste = await _demandeRepository.ObtenirEnAttenteAsync();
            return liste.ConvertAll(DemandeModificationMapper.VersDto);
        }

        public async Task<DemandeModificationDto> CreerAsync(DemandeModificationCreateDto dto)
        {
            await VerifierPersonnelExiste(dto.PersonnelId);
            await VerifierCreneauxAssociesAsync(dto.PersonnelId, dto.CreneauIds);

            var entite = DemandeModificationMapper.VersEntite(dto);
            await _demandeRepository.CreerAsync(entite);
            return DemandeModificationMapper.VersDto(entite);
        }

        public async Task MettreAJourAsync(string id, DemandeModificationUpdateDto dto)
        {
            var existante = await _demandeRepository.ObtenirParIdAsync(id);
            if (existante == null)
            {
                throw new KeyNotFoundException("Demande de modification introuvable.");
            }

            if (existante.Statut != StatutDemande.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les demandes en attente peuvent être modifiées.");
            }

            if (dto.CreneauIds != null)
            {
                await VerifierCreneauxAssociesAsync(existante.PersonnelId, dto.CreneauIds);
            }

            DemandeModificationMapper.MettreAJourEntite(dto, existante);
            await _demandeRepository.MettreAJourAsync(id, existante);
        }

        public async Task SupprimerAsync(string id)
        {
            var entite = await _demandeRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Demande de modification introuvable.");
            }

            if (entite.Statut != StatutDemande.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les demandes en attente peuvent être supprimées.");
            }

            await _demandeRepository.SupprimerAsync(id);
        }

        public async Task ApprouverAsync(string id, string traiteurId, string? commentaire = null)
        {
            var entite = await _demandeRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Demande de modification introuvable.");
            }

            if (entite.Statut != StatutDemande.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les demandes en attente peuvent être approuvées.");
            }

            await VerifierValideurAutorise(traiteurId);

            entite.Statut = StatutDemande.APPROUVEE;
            entite.TraiteurId = traiteurId;
            await _demandeRepository.MettreAJourAsync(id, entite);
        }

        public async Task RejeterAsync(string id, string traiteurId, string? commentaire = null)
        {
            var entite = await _demandeRepository.ObtenirParIdAsync(id);
            if (entite == null)
            {
                throw new KeyNotFoundException("Demande de modification introuvable.");
            }

            if (entite.Statut != StatutDemande.EN_ATTENTE)
            {
                throw new TransitionNonAutoriseeException("Seules les demandes en attente peuvent être rejetées.");
            }

            await VerifierValideurAutorise(traiteurId);

            entite.Statut = StatutDemande.REJETEE;
            entite.TraiteurId = traiteurId;
            await _demandeRepository.MettreAJourAsync(id, entite);
        }

        private async Task VerifierPersonnelExiste(string personnelId)
        {
            var personnel = await _personnelRepository.ObtenirParIdAsync(personnelId);
            if (personnel == null)
            {
                throw new KeyNotFoundException("Personnel associé à la demande introuvable.");
            }
        }

        private async Task VerifierValideurAutorise(string valideurId)
        {
            var valideur = await _personnelRepository.ObtenirParIdAsync(valideurId);
            if (valideur is not ChefDeService && valideur is not Directeur)
            {
                throw new HabilitationException("Seul un chef de service ou directeur peut traiter une demande de modification.");
            }
        }

        private async Task VerifierCreneauxAssociesAsync(string personnelId, List<string>? creneauIds)
        {
            if (creneauIds == null)
            {
                return;
            }

            foreach (var creneauId in creneauIds)
            {
                var creneau = await _creneauRepository.ObtenirParIdAsync(creneauId);
                if (creneau == null)
                {
                    throw new KeyNotFoundException("Un des créneaux associés à la demande est introuvable.");
                }

                if (!creneau.PersonnelIds.Contains(personnelId))
                {
                    throw new RegleMetierException("Le personnel doit être affecté aux créneaux mentionnés dans la demande de modification.");
                }
            }
        }
    }
}

