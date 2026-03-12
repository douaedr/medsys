using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class MedecinJuniorMapper
    {
        public static MedecinJuniorDto VersDto(MedecinJunior entite)
        {
            var dto = new MedecinJuniorDto
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
                Specialite = entite.Specialite,
                NumeroOrdre = entite.NumeroOrdre,
                TitresProfessionnels = entite.TitresProfessionnels,
                Promotion = entite.Promotion,
                NiveauFormation = entite.NiveauFormation,
                Type = entite.GetType().Name
            };
            return dto;
        }
    }
}