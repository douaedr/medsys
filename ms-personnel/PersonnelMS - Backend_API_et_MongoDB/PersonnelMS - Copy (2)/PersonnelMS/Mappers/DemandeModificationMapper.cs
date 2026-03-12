using System;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    /// <summary>
    /// Mapper pour les entités de type DemandeModification.
    /// </summary>
    public static class DemandeModificationMapper
    {
        public static DemandeModificationDto VersDto(DemandeModification entite)
        {
            return new DemandeModificationDto
            {
                Id = entite.Id,
                Type = entite.Type,
                Motif = entite.Motif,
                Statut = entite.Statut,
                DateDemande = entite.DateDemande,
                PersonnelId = entite.PersonnelId,
                TraiteurId = entite.TraiteurId,
                CreneauIds = entite.CreneauIds
            };
        }

        public static DemandeModification VersEntite(DemandeModificationCreateDto dto)
        {
            return new DemandeModification
            {
                Type = dto.Type,
                Motif = dto.Motif,
                PersonnelId = dto.PersonnelId,
                CreneauIds = dto.CreneauIds,
                DateDemande = DateTime.UtcNow,
                Statut = StatutDemande.EN_ATTENTE
            };
        }

        public static void MettreAJourEntite(DemandeModificationUpdateDto dto, DemandeModification entite)
        {
            entite.Type = dto.Type;
            entite.Motif = dto.Motif;
            if (dto.CreneauIds != null)
            {
                entite.CreneauIds = dto.CreneauIds;
            }
        }
    }
}

