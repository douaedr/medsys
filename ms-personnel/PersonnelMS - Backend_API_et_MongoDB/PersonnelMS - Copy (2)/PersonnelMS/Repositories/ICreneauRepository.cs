using PersonnelMS.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    public interface ICreneauRepository : IRepository<Creneau>
    {
        Task<List<Creneau>> ObtenirCreneauxParPersonnelEtPeriode(string personnelId, DateTime debut, DateTime fin);
        Task<List<Creneau>> ObtenirCreneauxParPlanningId(string planningId);
    }
}