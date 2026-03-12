using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace PersonnelMS.Repositories
{
    /// <summary>
    /// Implémentation générique d'un repository MongoDB.
    /// </summary>
    /// <typeparam name="T">Type de document MongoDB.</typeparam>
    public class Repository<T> : IRepository<T>
    {
        protected readonly IMongoCollection<T> _collection;

        public Repository(IMongoDatabase database, string nomCollection)
        {
            _collection = database.GetCollection<T>(nomCollection);
        }

        public async Task<List<T>> ObtenirTousAsync()
        {
            return await _collection.Find(Builders<T>.Filter.Empty).ToListAsync();
        }

        public async Task<T?> ObtenirParIdAsync(string id)
        {
            if (!MongoDB.Bson.ObjectId.TryParse(id, out var objId))
            {
                return default;
            }
            var filter = Builders<T>.Filter.Eq("_id", objId);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task CreerAsync(T entite)
        {
            await _collection.InsertOneAsync(entite);
        }

        public async Task MettreAJourAsync(string id, T entite)
        {
            if (!MongoDB.Bson.ObjectId.TryParse(id, out var objId))
            {
                return;
            }
            var filter = Builders<T>.Filter.Eq("_id", objId);
            await _collection.ReplaceOneAsync(filter, entite);
        }

        public async Task SupprimerAsync(string id)
        {
            if (!MongoDB.Bson.ObjectId.TryParse(id, out var objId))
            {
                return;
            }
            var filter = Builders<T>.Filter.Eq("_id", objId);
            await _collection.DeleteOneAsync(filter);
        }

        public async Task<bool> ExisteAsync(Expression<Func<T, bool>> predicate)
        {
            var count = await _collection.CountDocumentsAsync(predicate);
            return count > 0;
        }

        public async Task<(List<T> Items, long Total)> ObtenirPageAsync(FilterDefinition<T>? filtre = null, SortDefinition<T>? tri = null, int page = 1, int taillePage = 20)
        {
            var f = filtre ?? Builders<T>.Filter.Empty;
            var total = await _collection.CountDocumentsAsync(f);
            var skip = Math.Max(0, (page - 1) * taillePage);
            var size = Math.Min(100, Math.Max(1, taillePage));
            var find = _collection.Find(f);
            if (tri != null)
                find = find.Sort(tri);
            var items = await find.Skip(skip).Limit(size).ToListAsync();
            return (items, total);
        }
    }
}
