using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using PersonnelMS.Enums;
using PersonnelMS.Models;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Implémentation du repository pour les disponibilités.
    /// </summary>
    public class DisponibiliteRepository : Repository<Disponibilite>, IDisponibiliteRepository
    {
        public DisponibiliteRepository(IMongoDatabase database)
            : base(database, "Disponibilite")
        {
        }

        public async Task<List<Disponibilite>> ObtenirParPersonnelIdAsync(string personnelId)
        {
            var filter = Builders<Disponibilite>.Filter.Eq(d => d.PersonnelId, personnelId);
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<bool> ExisteChevauchementAsync(string personnelId, JourSemaine jour, TimeSpan debut, TimeSpan fin, string? ignoreId = null)
        {
            var builder = Builders<Disponibilite>.Filter;

            var filter = builder.And(
                builder.Eq(d => d.PersonnelId, personnelId),
                builder.Eq(d => d.Jour, jour),
                builder.Lt(d => d.HeureDebut, fin),
                builder.Gt(d => d.HeureFin, debut)
            );

            if (!string.IsNullOrWhiteSpace(ignoreId) && ObjectId.TryParse(ignoreId, out var objId))
            {
                var idFilter = builder.Ne("_id", objId);
                filter = builder.And(filter, idFilter);
            }

            var count = await _collection.CountDocumentsAsync(filter);
            return count > 0;
        }
    }
}

