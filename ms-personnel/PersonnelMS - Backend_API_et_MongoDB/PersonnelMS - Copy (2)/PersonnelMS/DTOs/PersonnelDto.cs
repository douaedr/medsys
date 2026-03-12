using System;
using PersonnelMS.Enums;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'un personnel.
    /// </summary>
    public class PersonnelDto
    {
        public string Id { get; set; } = default!;
        public string Nom { get; set; } = default!;
        public string Prenom { get; set; } = default!;
        public string Courriel { get; set; } = default!;
        public string? Telephone { get; set; }
        public string Matricule { get; set; } = default!;
        public Statut Statut { get; set; }
        public DateTime DateEmbauche { get; set; }
        public string Poste { get; set; } = default!;
        
        /// <summary>
        /// Chaîne contenant le nom du type concret (par ex. "MedecinJunior").
        /// Utile pour que le client sache à quel DTO spécifique s'attendre.
        /// </summary>
        public string? Type { get; set; }
    }
}