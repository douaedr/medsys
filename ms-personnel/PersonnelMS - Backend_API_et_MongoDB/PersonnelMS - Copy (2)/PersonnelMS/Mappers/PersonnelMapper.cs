using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    /// <summary>
    /// Fournit des méthodes de conversion entre entités et DTOs pour le personnel.
    /// </summary>
    public static class PersonnelMapper
    {
        public static PersonnelDto VersDto(Personnel entite)
        {
            // dispatch selon le type concret pour conserver les champs spécifiques
            switch (entite)
            {
                case ChefDeService chef:
                    return ChefDeServiceMapper.VersDto(chef);
                case MedecinSenior senior:
                    return MedecinSeniorMapper.VersDto(senior);
                case MedecinJunior junior:
                    return MedecinJuniorMapper.VersDto(junior);
                case Medecin medecin:
                    return MedecinMapper.VersDto(medecin);
                case InfirmierMajorant majorant:
                    return InfirmierMajorantMapper.VersDto(majorant);
                case Infirmier infirmier:
                    return InfirmierMapper.VersDto(infirmier);
                case AideSoignant aide:
                    return AideSoignantMapper.VersDto(aide);
                case Brancardier branc:
                    return BrancardierMapper.VersDto(branc);
                case Secretaire sec:
                    return SecretaireMapper.VersDto(sec);
                case Directeur dir:
                    return DirecteurMapper.VersDto(dir);
                default:
                    // personnel générique
                    return new PersonnelDto
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
        }

        public static Personnel VersEntite(PersonnelCreateDto dto)
        {
            return new Personnel
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

        public static void MettreAJourEntite(PersonnelUpdateDto dto, Personnel entite)
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