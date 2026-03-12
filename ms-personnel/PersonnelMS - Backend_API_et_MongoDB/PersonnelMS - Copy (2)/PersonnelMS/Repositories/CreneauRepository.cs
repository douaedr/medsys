using MongoDB.Driver;
using PersonnelMS.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    public class CreneauRepository : Repository<Creneau>, ICreneauRepository
    {
        public CreneauRepository(IMongoDatabase database)
            : base(database, "Creneau")
        {
        }

        public async Task<List<Creneau>> ObtenirCreneauxParPersonnelEtPeriode(string personnelId, DateTime debut, DateTime fin)
        {
            var builder = Builders<Creneau>.Filter;
            var filter = builder.And(
                builder.Eq("PersonnelIds", personnelId),
                builder.Lte(c => c.Debut, fin),
                builder.Gte(c => c.Fin, debut)
            );
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<List<Creneau>> ObtenirCreneauxParPlanningId(string planningId)
        {
            var filter = Builders<Creneau>.Filter.Eq(c => c.PlanningId, planningId);
            return await _collection.Find(filter).ToListAsync();
        }
    }
}