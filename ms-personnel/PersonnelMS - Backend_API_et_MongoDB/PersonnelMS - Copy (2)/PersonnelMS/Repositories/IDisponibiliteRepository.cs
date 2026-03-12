using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Repository pour la gestion des disponibilités du personnel.
    /// </summary>
    public interface IDisponibiliteRepository : IRepository<Disponibilite>
    {
        Task<List<Disponibilite>> ObtenirParPersonnelIdAsync(string personnelId);

        Task<bool> ExisteChevauchementAsync(string personnelId, JourSemaine jour, TimeSpan debut, TimeSpan fin, string? ignoreId = null);
    }
}

