using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Implémentation du repository pour les demandes de modification de planning.
    /// </summary>
    public class DemandeModificationRepository : Repository<DemandeModification>, IDemandeModificationRepository
    {
        public DemandeModificationRepository(IMongoDatabase database)
            : base(database, "DemandeModification")
        {
        }

        public async Task<List<DemandeModification>> ObtenirParPersonnelIdAsync(string personnelId)
        {
            var filter = Builders<DemandeModification>.Filter.Eq(d => d.PersonnelId, personnelId);
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<List<DemandeModification>> ObtenirEnAttenteAsync()
        {
            var filter = Builders<DemandeModification>.Filter.Eq(d => d.Statut, StatutDemande.EN_ATTENTE);
            return await _collection.Find(filter).ToListAsync();
        }
    }
}

