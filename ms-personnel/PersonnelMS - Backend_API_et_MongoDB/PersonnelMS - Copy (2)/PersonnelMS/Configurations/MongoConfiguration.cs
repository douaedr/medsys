using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using PersonnelMS.Models;
using System.Threading.Tasks;

namespace PersonnelMS.Configurations
{
    public static class MongoConfiguration
    {
        private static bool _conventionsConfigurees;
        private static readonly object _lockConventions = new();

        /// <summary>
        /// Configure les conventions MongoDB (camelCase, ignore extra elements, etc.).
        /// Idempotent : peut être appelé plusieurs fois (ex: tests d'intégration).
        /// </summary>
        public static void ConfigurerConventions()
        {
            lock (_lockConventions)
            {
                if (_conventionsConfigurees)
                    return;

                var conventionPack = new ConventionPack
                {
                    new CamelCaseElementNameConvention(),
                    new IgnoreExtraElementsConvention(true)
                };
                ConventionRegistry.Register("CustomConventions", conventionPack, t => true);

                // enregistrement explicite des classes pour s'assurer que les discriminators sont connus
                if (!MongoDB.Bson.Serialization.BsonClassMap.IsClassMapRegistered(typeof(Personnel)))
            {
                MongoDB.Bson.Serialization.BsonClassMap.RegisterClassMap<Personnel>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIsRootClass(true);
                });
            }
            // les sous-classes ont déjà des attributs BsonDiscriminator mais on peut aussi les mapper
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Directeur));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Medecin));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(MedecinSenior));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(MedecinJunior));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(ChefDeService));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Infirmier));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(InfirmierMajorant));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(AideSoignant));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Secretaire));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Brancardier));
            // enregistrements pour nouvelles collections
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Models.Equipe));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Models.Planning));
            MongoDB.Bson.Serialization.BsonClassMap.LookupClassMap(typeof(Models.Creneau));

                _conventionsConfigurees = true;
            }
        }

        /// <summary>
        /// Crée les index uniques sur la collection de personnel.
        /// </summary>
        public static async Task CreerIndexesPersonnelsAsync(IMongoDatabase database)
        {
            var collection = database.GetCollection<Personnel>("Personnel");
            var indexOptions = new CreateIndexOptions { Unique = true };

            var indexCourriel = new CreateIndexModel<Personnel>(
                Builders<Personnel>.IndexKeys.Ascending(p => p.Courriel), indexOptions);
            var indexMatricule = new CreateIndexModel<Personnel>(
                Builders<Personnel>.IndexKeys.Ascending(p => p.Matricule), indexOptions);

            // index partiel unique pour numeroOrdre (present uniquement pour les médecins)
            var indexNumeroOrdreOptions = new CreateIndexOptions { Unique = true, Sparse = true };
            var indexNumeroOrdre = new CreateIndexModel<Personnel>(
                Builders<Personnel>.IndexKeys.Ascending("numeroOrdre"), indexNumeroOrdreOptions);

            try
            {
                await collection.Indexes.CreateManyAsync(new[] { indexCourriel, indexMatricule, indexNumeroOrdre });
            }
            catch (MongoDB.Driver.MongoCommandException ex) when (ex.Message.Contains("E11000"))
            {
                // index already exists or duplicate values present, log and continue
            }
        }

        /// <summary>
        /// Crée les index nécessaires pour la collection Creneau.
        /// </summary>
        public static async Task CreerIndexesCreneauxAsync(IMongoDatabase database)
        {
            var creneauCollection = database.GetCollection<Creneau>("Creneau");

            // index sur PlanningId
            var indexPlanning = new CreateIndexModel<Creneau>(
                Builders<Creneau>.IndexKeys.Ascending(c => c.PlanningId));

            // index pour chevauchements: multikey sur PersonnelIds + débuts/fin
            var overlapKeys = Builders<Creneau>.IndexKeys
                .Ascending("PersonnelIds")
                .Ascending(c => c.Debut)
                .Ascending(c => c.Fin);
            var indexOverlap = new CreateIndexModel<Creneau>(overlapKeys);

            // index temporels
            var indexDates = new CreateIndexModel<Creneau>(
                Builders<Creneau>.IndexKeys.Ascending(c => c.Debut).Ascending(c => c.Fin));

            try
            {
                await creneauCollection.Indexes.CreateManyAsync(new[] { indexPlanning, indexOverlap, indexDates });
            }
            catch (MongoDB.Driver.MongoCommandException ex) when (ex.Message.Contains("E11000"))
            {
                // ignore
            }
        }

        /// <summary>
        /// Crée des index pour la collection Planning (équipe).
        /// </summary>
        public static async Task CreerIndexesPlanningsAsync(IMongoDatabase database)
        {
            var planningCollection = database.GetCollection<Planning>("Planning");
            var indexEquipe = new CreateIndexModel<Planning>(
                Builders<Planning>.IndexKeys.Ascending(p => p.EquipeId));
            try
            {
                await planningCollection.Indexes.CreateOneAsync(indexEquipe);
            }
            catch (MongoDB.Driver.MongoCommandException) { }
        }

        /// <summary>
        /// Crée les index nécessaires pour la collection Disponibilite.
        /// </summary>
        public static async Task CreerIndexesDisponibilitesAsync(IMongoDatabase database)
        {
            var collection = database.GetCollection<Disponibilite>("Disponibilite");

            var indexPersonnel = new CreateIndexModel<Disponibilite>(
                Builders<Disponibilite>.IndexKeys.Ascending(d => d.PersonnelId));

            try
            {
                await collection.Indexes.CreateOneAsync(indexPersonnel);
            }
            catch (MongoDB.Driver.MongoCommandException) { }
        }

        /// <summary>
        /// Crée les index nécessaires pour la collection Absence.
        /// </summary>
        public static async Task CreerIndexesAbsencesAsync(IMongoDatabase database)
        {
            var collection = database.GetCollection<Absence>("Absence");

            var indexPersonnel = new CreateIndexModel<Absence>(
                Builders<Absence>.IndexKeys.Ascending(a => a.PersonnelId));
            var indexStatut = new CreateIndexModel<Absence>(
                Builders<Absence>.IndexKeys.Ascending(a => a.Statut));
            var indexPersonnelStatut = new CreateIndexModel<Absence>(
                Builders<Absence>.IndexKeys
                    .Ascending(a => a.PersonnelId)
                    .Ascending(a => a.Statut));
            var indexStatutDateDebut = new CreateIndexModel<Absence>(
                Builders<Absence>.IndexKeys
                    .Ascending(a => a.Statut)
                    .Ascending(a => a.DateDebut));
            var indexTypeDateDebut = new CreateIndexModel<Absence>(
                Builders<Absence>.IndexKeys
                    .Ascending(a => a.Type)
                    .Ascending(a => a.DateDebut));

            try
            {
                await collection.Indexes.CreateManyAsync(new[] { indexPersonnel, indexStatut, indexPersonnelStatut, indexStatutDateDebut, indexTypeDateDebut });
            }
            catch (MongoDB.Driver.MongoCommandException) { }
        }

        /// <summary>
        /// Crée les index nécessaires pour la collection Equipe (rapports).
        /// </summary>
        public static async Task CreerIndexesEquipesAsync(IMongoDatabase database)
        {
            var collection = database.GetCollection<Equipe>("Equipe");
            var indexChefDeService = new CreateIndexModel<Equipe>(
                Builders<Equipe>.IndexKeys.Ascending(e => e.ChefDeServiceId));
            try
            {
                await collection.Indexes.CreateOneAsync(indexChefDeService);
            }
            catch (MongoDB.Driver.MongoCommandException) { }
        }

        /// <summary>
        /// Crée les index nécessaires pour la collection DemandeModification.
        /// </summary>
        public static async Task CreerIndexesDemandesModificationAsync(IMongoDatabase database)
        {
            var collection = database.GetCollection<DemandeModification>("DemandeModification");

            var indexPersonnel = new CreateIndexModel<DemandeModification>(
                Builders<DemandeModification>.IndexKeys.Ascending(d => d.PersonnelId));
            var indexStatut = new CreateIndexModel<DemandeModification>(
                Builders<DemandeModification>.IndexKeys.Ascending(d => d.Statut));
            var indexPersonnelStatut = new CreateIndexModel<DemandeModification>(
                Builders<DemandeModification>.IndexKeys
                    .Ascending(d => d.PersonnelId)
                    .Ascending(d => d.Statut));

            try
            {
                await collection.Indexes.CreateManyAsync(new[] { indexPersonnel, indexStatut, indexPersonnelStatut });
            }
            catch (MongoDB.Driver.MongoCommandException) { }
        }
    }
}