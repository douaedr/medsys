using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.Models;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Repository pour la gestion des demandes de modification de planning.
    /// </summary>
    public interface IDemandeModificationRepository : IRepository<DemandeModification>
    {
        Task<List<DemandeModification>> ObtenirParPersonnelIdAsync(string personnelId);

        Task<List<DemandeModification>> ObtenirEnAttenteAsync();
    }
}

