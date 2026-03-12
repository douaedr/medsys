using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class AideSoignantMapper
    {
        public static AideSoignantDto VersDto(AideSoignant entite)
        {
            return new AideSoignantDto
            {
                Id = entite.Id,
                Nom = entite.Nom,
                Prenom = entite.Prenom,
                Courriel = entite.Courriel,
                Telephone = entite.Telephone,
                Matricule = entite.Matricule,
                Statut = entite.Statut,
                DateEmbauche = entite.DateEmbauche,
                Poste = entite.Poste,
                Unite = entite.Unite,
                Type = entite.GetType().Name
            };
        }

        public static AideSoignant VersEntite(AideSoignantCreateDto dto)
        {
            return new AideSoignant
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Courriel = dto.Courriel,
                Telephone = dto.Telephone,
                Matricule = dto.Matricule,
                Statut = dto.Statut,
                DateEmbauche = dto.DateEmbauche,
                Poste = dto.Poste,
                Unite = dto.Unite
            };
        }

        public static void MettreAJourEntite(AideSoignantUpdateDto dto, AideSoignant entite)
        {
            entite.Nom = dto.Nom;
            entite.Prenom = dto.Prenom;
            entite.Courriel = dto.Courriel;
            entite.Telephone = dto.Telephone;
            entite.Matricule = dto.Matricule;
            entite.Statut = dto.Statut;
            entite.DateEmbauche = dto.DateEmbauche;
            entite.Poste = dto.Poste;
            entite.Unite = dto.Unite;
        }
    }
}