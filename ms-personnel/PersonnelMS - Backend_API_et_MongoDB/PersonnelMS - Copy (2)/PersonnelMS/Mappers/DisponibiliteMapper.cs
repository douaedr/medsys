using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    /// <summary>
    /// Mapper pour les entités de type Disponibilite.
    /// </summary>
    public static class DisponibiliteMapper
    {
        public static DisponibiliteDto VersDto(Disponibilite entite)
        {
            return new DisponibiliteDto
            {
                Id = entite.Id,
                Jour = entite.Jour,
                HeureDebut = entite.HeureDebut,
                HeureFin = entite.HeureFin,
                Priorite = entite.Priorite,
                PersonnelId = entite.PersonnelId
            };
        }

        public static Disponibilite VersEntite(DisponibiliteCreateDto dto)
        {
            return new Disponibilite
            {
                Jour = dto.Jour,
                HeureDebut = dto.HeureDebut,
                HeureFin = dto.HeureFin,
                Priorite = dto.Priorite,
                PersonnelId = dto.PersonnelId
            };
        }

        public static void MettreAJourEntite(DisponibiliteUpdateDto dto, Disponibilite entite)
        {
            entite.Jour = dto.Jour;
            entite.HeureDebut = dto.HeureDebut;
            entite.HeureFin = dto.HeureFin;
            entite.Priorite = dto.Priorite;
            entite.PersonnelId = dto.PersonnelId;
        }
    }
}

