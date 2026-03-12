using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class PlanningMapper
    {
        public static PlanningDto VersDto(Planning entite)
        {
            return new PlanningDto
            {
                Id = entite.Id,
                Nom = entite.Nom,
                DateDebut = entite.DateDebut,
                DateFin = entite.DateFin,
                Statut = entite.Statut,
                EquipeId = entite.EquipeId
            };
        }

        public static Planning VersEntite(PlanningCreateDto dto)
        {
            return new Planning
            {
                Nom = dto.Nom,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                Statut = dto.Statut,
                EquipeId = dto.EquipeId
            };
        }

        public static void MettreAJourEntite(PlanningUpdateDto dto, Planning entite)
        {
            entite.Nom = dto.Nom;
            entite.DateDebut = dto.DateDebut;
            entite.DateFin = dto.DateFin;
            entite.Statut = dto.Statut;
            entite.EquipeId = dto.EquipeId;
        }
    }
}