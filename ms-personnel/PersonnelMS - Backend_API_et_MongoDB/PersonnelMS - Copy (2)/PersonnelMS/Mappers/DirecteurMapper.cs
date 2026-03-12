using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class DirecteurMapper
    {
        public static DirecteurDto VersDto(Directeur entite)
        {
            return new DirecteurDto
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

        public static Directeur VersEntite(DirecteurCreateDto dto)
        {
            return new Directeur
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

        public static void MettreAJourEntite(DirecteurUpdateDto dto, Directeur entite)
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