using PersonnelMS.DTOs;
using PersonnelMS.Models;

namespace PersonnelMS.Mappers
{
    public static class InfirmierMajorantMapper
    {
        public static InfirmierMajorantDto VersDto(InfirmierMajorant entite)
        {
            // same as infirmier
            var baseDto = InfirmierMapper.VersDto(entite);
            return new InfirmierMajorantDto
            {
                Id = baseDto.Id,
                Nom = baseDto.Nom,
                Prenom = baseDto.Prenom,
                Courriel = baseDto.Courriel,
                Telephone = baseDto.Telephone,
                Matricule = baseDto.Matricule,
                Statut = baseDto.Statut,
                DateEmbauche = baseDto.DateEmbauche,
                Poste = baseDto.Poste,
                Unite = baseDto.Unite,
                Diplome = baseDto.Diplome,
                Type = entite.GetType().Name
            };
        }
    }
}