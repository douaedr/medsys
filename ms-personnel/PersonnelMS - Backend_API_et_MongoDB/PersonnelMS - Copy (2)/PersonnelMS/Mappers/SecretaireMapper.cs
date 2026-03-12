using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class SecretaireMapper
    {
        public static SecretaireDto VersDto(Secretaire entite)
        {
            return new SecretaireDto
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
                Type = entite.GetType().Name
            };
        }

        public static Secretaire VersEntite(SecretaireCreateDto dto)
        {
            return new Secretaire
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Courriel = dto.Courriel,
                Telephone = dto.Telephone,
                Matricule = dto.Matricule,
                Statut = dto.Statut,
                DateEmbauche = dto.DateEmbauche,
                Poste = dto.Poste
            };
        }

        public static void MettreAJourEntite(SecretaireUpdateDto dto, Secretaire entite)
        {
            entite.Nom = dto.Nom;
            entite.Prenom = dto.Prenom;
            entite.Courriel = dto.Courriel;
            entite.Telephone = dto.Telephone;
            entite.Matricule = dto.Matricule;
            entite.Statut = dto.Statut;
            entite.DateEmbauche = dto.DateEmbauche;
            entite.Poste = dto.Poste;
        }
    }
}