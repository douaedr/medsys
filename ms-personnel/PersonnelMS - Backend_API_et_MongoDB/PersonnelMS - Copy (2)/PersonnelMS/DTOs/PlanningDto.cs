using System;
using PersonnelMS.Enums;
using System.Collections.Generic;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO utilisé pour la lecture d'un planning.
    /// </summary>
    public class PlanningDto
    {
        public string Id { get; set; } = default!;
        public string Nom { get; set; } = default!;
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public StatutPlanning Statut { get; set; }
        public string EquipeId { get; set; } = default!;
        /// <summary>
        /// Liste des identifiants de créneaux éventuellement associés (non remplie par défaut).
        /// </summary>
        public List<string>? CreneauIds { get; set; }
    }
}