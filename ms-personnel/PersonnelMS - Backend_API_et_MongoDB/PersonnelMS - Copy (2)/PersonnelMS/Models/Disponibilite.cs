using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;
using System;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente une déclaration de disponibilité d'un membre du personnel.
    /// </summary>
    public class Disponibilite
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("jour")]
        [BsonRepresentation(BsonType.String)]
        public JourSemaine Jour { get; set; }

        [BsonElement("heureDebut")]
        public TimeSpan HeureDebut { get; set; }

        [BsonElement("heureFin")]
        public TimeSpan HeureFin { get; set; }

        [BsonElement("priorite")]
        [BsonRepresentation(BsonType.String)]
        public Priorite Priorite { get; set; }

        [BsonElement("personnelId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonnelId { get; set; } = default!;
    }
}

