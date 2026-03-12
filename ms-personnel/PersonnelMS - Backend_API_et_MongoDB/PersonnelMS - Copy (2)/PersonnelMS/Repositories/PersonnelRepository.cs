using MongoDB.Driver;
using PersonnelMS.Models;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    public class PersonnelRepository : Repository<Personnel>, IPersonnelRepository
    {
        public PersonnelRepository(IMongoDatabase database)
            : base(database, "Personnel")
        {
        }

        public async Task<Personnel?> ObtenirParCourrielAsync(string courriel)
        {
            var filter = Builders<Personnel>.Filter.Eq(p => p.Courriel, courriel);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Personnel?> ObtenirParMatriculeAsync(string matricule)
        {
            var filter = Builders<Personnel>.Filter.Eq(p => p.Matricule, matricule);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<List<TPersonnel>> ObtenirParTypeAsync<TPersonnel>() where TPersonnel : Personnel
        {
            // OfType<> returns IFilteredMongoCollection which does not expose ToListAsync directly,
            // so we perform a find with empty filter to retrieve all documents of the subtype.
            var filtered = _collection.OfType<TPersonnel>();
            return await filtered.Find(Builders<TPersonnel>.Filter.Empty).ToListAsync();
        }
    }
}