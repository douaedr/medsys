using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.Models;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Repository pour la gestion des absences du personnel.
    /// </summary>
    public interface IAbsenceRepository : IRepository<Absence>
    {
        Task<List<Absence>> ObtenirParPersonnelIdAsync(string personnelId);

        Task<List<Absence>> ObtenirEnAttenteAsync();
    }
}

