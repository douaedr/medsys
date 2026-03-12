using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Interface générique pour les opérations CRUD.
    /// </summary>
    /// <typeparam name="T">Type de l'entité.</typeparam>
    public interface IRepository<T>
    {
        Task<List<T>> ObtenirTousAsync();
        /// <summary>
        /// Retourne une page de résultats avec tri et filtre optionnels.
        /// </summary>
        Task<(List<T> Items, long Total)> ObtenirPageAsync(FilterDefinition<T>? filtre = null, SortDefinition<T>? tri = null, int page = 1, int taillePage = 20);
        Task<T?> ObtenirParIdAsync(string id);
        Task CreerAsync(T entite);
        Task MettreAJourAsync(string id, T entite);
        Task SupprimerAsync(string id);
        Task<bool> ExisteAsync(Expression<Func<T, bool>> predicate);
    }
}