using MongoDB.Driver;
using PersonnelMS.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    public class PlanningRepository : Repository<Planning>, IPlanningRepository
    {
        public PlanningRepository(IMongoDatabase database)
            : base(database, "Planning")
        {
        }

        public async Task<List<Planning>> ObtenirParEquipeIdAsync(string equipeId)
        {
            var filter = Builders<Planning>.Filter.Eq(p => p.EquipeId, equipeId);
            return await _collection.Find(filter).ToListAsync();
        }
    }
}