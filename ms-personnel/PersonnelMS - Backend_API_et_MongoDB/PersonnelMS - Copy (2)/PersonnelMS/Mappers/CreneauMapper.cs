using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class CreneauMapper
    {
        public static CreneauDto VersDto(Creneau entite)
        {
            return new CreneauDto
            {
                Id = entite.Id,
                Debut = entite.Debut,
                Fin = entite.Fin,
                Type = entite.Type,
                Statut = entite.Statut,
                Lieu = entite.Lieu,
                PersonnelIds = entite.PersonnelIds,
                PlanningId = entite.PlanningId
            };
        }

        public static Creneau VersEntite(CreneauCreateDto dto)
        {
            return new Creneau
            {
                Debut = dto.Debut,
                Fin = dto.Fin,
                Type = dto.Type,
                Statut = dto.Statut,
                Lieu = dto.Lieu,
                PersonnelIds = dto.PersonnelIds ?? new System.Collections.Generic.List<string>(),
                PlanningId = dto.PlanningId
            };
        }

        public static void MettreAJourEntite(CreneauUpdateDto dto, Creneau entite)
        {
            entite.Debut = dto.Debut;
            entite.Fin = dto.Fin;
            entite.Type = dto.Type;
            entite.Statut = dto.Statut;
            entite.Lieu = dto.Lieu;
            if (dto.PersonnelIds != null)
                entite.PersonnelIds = dto.PersonnelIds;
            entite.PlanningId = dto.PlanningId;
        }
    }
}