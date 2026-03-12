using System;
using System.Collections.Generic;

namespace PersonnelMS.DTOs
{
    /// <summary>
    /// Résultat paginé pour les listes.
    /// </summary>
    /// <typeparam name="T">Type des éléments.</typeparam>
    public class PageResult<T>
    {
        /// <summary>
        /// Liste des éléments de la page.
        /// </summary>
        public List<T> Items { get; set; } = new List<T>();

        /// <summary>
        /// Numéro de page (1-based).
        /// </summary>
        public int Page { get; set; }

        /// <summary>
        /// Nombre d'éléments par page.
        /// </summary>
        public int TaillePage { get; set; }

        /// <summary>
        /// Nombre total d'éléments.
        /// </summary>
        public long Total { get; set; }

        /// <summary>
        /// Nombre total de pages.
        /// </summary>
        public int TotalPages => TaillePage > 0 ? (int)Math.Ceiling((double)Total / TaillePage) : 0;
    }
}
