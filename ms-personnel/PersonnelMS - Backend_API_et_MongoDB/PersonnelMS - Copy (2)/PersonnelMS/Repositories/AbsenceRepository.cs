using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Implémentation du repository pour les absences.
    /// </summary>
    public class AbsenceRepository : Repository<Absence>, IAbsenceRepository
    {
        public AbsenceRepository(IMongoDatabase database)
            : base(database, "Absence")
        {
        }

        public async Task<List<Absence>> ObtenirParPersonnelIdAsync(string personnelId)
        {
            var filter = Builders<Absence>.Filter.Eq(a => a.PersonnelId, personnelId);
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<List<Absence>> ObtenirEnAttenteAsync()
        {
            var filter = Builders<Absence>.Filter.Eq(a => a.Statut, StatutAbsence.EN_ATTENTE);
            return await _collection.Find(filter).ToListAsync();
        }
    }
}

