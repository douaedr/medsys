using PersonnelMS.DTOs;
using PersonnelMS.Models;
using PersonnelMS.Enums;
using System;

namespace PersonnelMS.Mappers
{
    public static class MedecinMapper
    {
        public static MedecinDto VersDto(Medecin entite)
        {
            var dto = new MedecinDto
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

        public static Medecin VersEntite(MedecinCreateDto dto)
        {
            Medecin baseMedecin;
            switch (dto.Type)
            {
                case TypeMedecin.Junior:
                    baseMedecin = new MedecinJunior
                    {
                        Promotion = dto.Promotion ?? throw new ArgumentException("Promotion requise pour un médecin junior."),
                        NiveauFormation = dto.NiveauFormation ?? throw new ArgumentException("NiveauFormation requis pour un médecin junior.")
                    };
                    break;
                case TypeMedecin.Senior:
                    baseMedecin = new MedecinSenior();
                    break;
                case TypeMedecin.ChefDeService:
                    baseMedecin = new ChefDeService
                    {
                        ServiceNom = dto.ServiceNom ?? throw new ArgumentException("ServiceNom requis pour un chef de service.")
                    };
                    break;
                default:
                    baseMedecin = new Medecin();
                    break;
            }

            // propriétés communes
            baseMedecin.Nom = dto.Nom;
            baseMedecin.Prenom = dto.Prenom;
            baseMedecin.Courriel = dto.Courriel;
            baseMedecin.Telephone = dto.Telephone;
            baseMedecin.Matricule = dto.Matricule;
            baseMedecin.Statut = dto.Statut;
            baseMedecin.DateEmbauche = dto.DateEmbauche;
            baseMedecin.Poste = dto.Poste;
            baseMedecin.Specialite = dto.Specialite;
            baseMedecin.NumeroOrdre = dto.NumeroOrdre;
            baseMedecin.TitresProfessionnels = dto.TitresProfessionnels;

            return baseMedecin;
        }

        public static void MettreAJourEntite(MedecinUpdateDto dto, Medecin entite)
        {
            // ne supporte pas le changement de type
            if (entite.GetType().Name != dto.Type.ToString())
            {
                throw new InvalidOperationException("Impossible de changer le type du médecin.");
            }

            entite.Nom = dto.Nom;
            entite.Prenom = dto.Prenom;
            entite.Courriel = dto.Courriel;
            entite.Telephone = dto.Telephone;
            entite.Matricule = dto.Matricule;
            entite.Statut = dto.Statut;
            entite.DateEmbauche = dto.DateEmbauche;
            entite.Poste = dto.Poste;
            entite.Specialite = dto.Specialite;
            entite.NumeroOrdre = dto.NumeroOrdre;
            entite.TitresProfessionnels = dto.TitresProfessionnels;

            switch (entite)
            {
                case MedecinJunior junior:
                    junior.Promotion = dto.Promotion ?? junior.Promotion;
                    junior.NiveauFormation = dto.NiveauFormation ?? junior.NiveauFormation;
                    break;
                case ChefDeService chef:
                    chef.ServiceNom = dto.ServiceNom ?? chef.ServiceNom;
                    break;
            }
        }
    }
}