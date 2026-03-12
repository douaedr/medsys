using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class EquipeMapper
    {
        public static EquipeDto VersDto(Equipe entite)
        {
            return new EquipeDto
            {
                Id = entite.Id,
                Nom = entite.Nom,
                Periodicite = entite.Periodicite,
                EffectifCible = entite.EffectifCible,
                EffectifMinimum = entite.EffectifMinimum,
                ChefEquipeId = entite.ChefEquipeId,
                EncadrantId = entite.EncadrantId,
                MembreIds = entite.MembreIds,
                ChefDeServiceId = entite.ChefDeServiceId
            };
        }

        public static Equipe VersEntite(EquipeCreateDto dto)
        {
            return new Equipe
            {
                Nom = dto.Nom,
                Periodicite = dto.Periodicite,
                EffectifCible = dto.EffectifCible,
                EffectifMinimum = dto.EffectifMinimum,
                ChefEquipeId = dto.ChefEquipeId,
                EncadrantId = dto.EncadrantId,
                ChefDeServiceId = dto.ChefDeServiceId,
                MembreIds = dto.MembreIds ?? new System.Collections.Generic.List<string>()
            };
        }

        public static void MettreAJourEntite(EquipeUpdateDto dto, Equipe entite)
        {
            entite.Nom = dto.Nom;
            entite.Periodicite = dto.Periodicite;
            entite.EffectifCible = dto.EffectifCible;
            entite.EffectifMinimum = dto.EffectifMinimum;
            entite.ChefEquipeId = dto.ChefEquipeId;
            entite.EncadrantId = dto.EncadrantId;
            entite.ChefDeServiceId = dto.ChefDeServiceId;
            if (dto.MembreIds != null)
                entite.MembreIds = dto.MembreIds;
        }
    }
}