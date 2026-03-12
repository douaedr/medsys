using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    /// <summary>
    /// Mapper pour les entités de type Absence.
    /// </summary>
    public static class AbsenceMapper
    {
        public static AbsenceDto VersDto(Absence entite)
        {
            return new AbsenceDto
            {
                Id = entite.Id,
                Type = entite.Type,
                DateDebut = entite.DateDebut,
                DateFin = entite.DateFin,
                Motif = entite.Motif,
                Statut = entite.Statut,
                Justificatif = entite.Justificatif,
                PersonnelId = entite.PersonnelId,
                ValideurId = entite.ValideurId
            };
        }

        public static Absence VersEntite(AbsenceCreateDto dto)
        {
            return new Absence
            {
                Type = dto.Type,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                Motif = dto.Motif,
                Justificatif = dto.Justificatif,
                PersonnelId = dto.PersonnelId,
                Statut = StatutAbsence.EN_ATTENTE
            };
        }

        public static void MettreAJourEntite(AbsenceUpdateDto dto, Absence entite)
        {
            entite.Type = dto.Type;
            entite.DateDebut = dto.DateDebut;
            entite.DateFin = dto.DateFin;
            entite.Motif = dto.Motif;
            entite.Justificatif = dto.Justificatif;
            entite.PersonnelId = dto.PersonnelId;
        }
    }
}

