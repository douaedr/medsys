using PersonnelMS.Models;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Interface spécifique pour le personnel, permettant d'ajouter des méthodes particulières.
    /// </summary>
    public interface IPersonnelRepository : IRepository<Personnel>
    {
        Task<Personnel?> ObtenirParCourrielAsync(string courriel);
        Task<Personnel?> ObtenirParMatriculeAsync(string matricule);
        
        /// <summary>
        /// Retourne tous les documents de la collection qui sont du type spécifié (ou d'une de ses sous-classes).
        /// Utile pour récupérer uniquement les médecins, infirmiers, etc.
        /// </summary>
        Task<List<TPersonnel>> ObtenirParTypeAsync<TPersonnel>() where TPersonnel : Personnel;
    }
}