using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class MedecinSeniorMapper
    {
        public static MedecinSeniorDto VersDto(MedecinSenior entite)
        {
            var dto = new MedecinSeniorDto
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
                Type = entite.GetType().Name
            };
            return dto;
        }
    }
}