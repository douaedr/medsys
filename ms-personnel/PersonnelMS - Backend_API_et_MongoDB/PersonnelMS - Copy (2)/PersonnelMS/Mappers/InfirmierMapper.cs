using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class InfirmierMapper
    {
        public static InfirmierDto VersDto(Infirmier entite)
        {
            return new InfirmierDto
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
                Diplome = entite.Diplome,
                Type = entite.GetType().Name
            };
        }

        public static Infirmier VersEntite(InfirmierCreateDto dto)
        {
            Infirmier entite = dto.Type switch
            {
                TypeInfirmier.InfirmierMajorant => new InfirmierMajorant(),
                _ => new Infirmier()
            };

            entite.Nom = dto.Nom;
            entite.Prenom = dto.Prenom;
            entite.Courriel = dto.Courriel;
            entite.Telephone = dto.Telephone;
            entite.Matricule = dto.Matricule;
            entite.Statut = dto.Statut;
            entite.DateEmbauche = dto.DateEmbauche;
            entite.Poste = dto.Poste;
            entite.Unite = dto.Unite;
            entite.Diplome = dto.Diplome;

            return entite;
        }

        public static void MettreAJourEntite(InfirmierUpdateDto dto, Infirmier entite)
        {
            // On ne change pas le type concret (Infirmier vs InfirmierMajorant) via la mise à jour.
            // Le champ dto.Type est uniquement là pour validation/cohérence.
            entite.Nom = dto.Nom;
            entite.Prenom = dto.Prenom;
            entite.Courriel = dto.Courriel;
            entite.Telephone = dto.Telephone;
            entite.Matricule = dto.Matricule;
            entite.Statut = dto.Statut;
            entite.DateEmbauche = dto.DateEmbauche;
            entite.Poste = dto.Poste;
            entite.Unite = dto.Unite;
            entite.Diplome = dto.Diplome;
        }
    }
}