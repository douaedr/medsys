using PersonnelMS.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    public interface IPlanningRepository : IRepository<Planning>
    {
        // méthode utile pour récupérer plannings par équipe
        Task<List<Planning>> ObtenirParEquipeIdAsync(string equipeId);
    }
}