using MongoDB.Driver;
using PersonnelMS.Models;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    public class EquipeRepository : Repository<Equipe>, IEquipeRepository
    {
        public EquipeRepository(IMongoDatabase database)
            : base(database, "Equipe")
        {
        }
    }
}