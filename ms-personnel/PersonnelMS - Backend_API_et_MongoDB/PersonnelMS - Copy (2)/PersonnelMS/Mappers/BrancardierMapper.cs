using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class BrancardierMapper
    {
        public static BrancardierDto VersDto(Brancardier entite)
        {
            return new BrancardierDto
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
                ZoneCouverture = entite.ZoneCouverture,
                Type = entite.GetType().Name
            };
        }

        public static Brancardier VersEntite(BrancardierCreateDto dto)
        {
            return new Brancardier
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Courriel = dto.Courriel,
                Telephone = dto.Telephone,
                Matricule = dto.Matricule,
                Statut = dto.Statut,
                DateEmbauche = dto.DateEmbauche,
                Poste = dto.Poste,
                ZoneCouverture = dto.ZoneCouverture
            };
        }

        public static void MettreAJourEntite(BrancardierUpdateDto dto, Brancardier entite)
        {
            entite.Nom = dto.Nom;
            entite.Prenom = dto.Prenom;
            entite.Courriel = dto.Courriel;
            entite.Telephone = dto.Telephone;
            entite.Matricule = dto.Matricule;
            entite.Statut = dto.Statut;
            entite.DateEmbauche = dto.DateEmbauche;
            entite.Poste = dto.Poste;
            entite.ZoneCouverture = dto.ZoneCouverture;
        }
    }
}