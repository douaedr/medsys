using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;
using System;
using System.Collections.Generic;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un créneau horaire dans un planning.
    /// </summary>
    public class Creneau
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("debut")]
        public DateTime Debut { get; set; }

        [BsonElement("fin")]
        public DateTime Fin { get; set; }

        [BsonElement("type")]
        [BsonRepresentation(BsonType.String)]
        public TypeCreneau Type { get; set; }

        [BsonElement("statut")]
        [BsonRepresentation(BsonType.String)]
        public StatutCreneau Statut { get; set; }

        [BsonElement("lieu")]
        public string Lieu { get; set; } = default!;

        [BsonElement("personnelIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string> PersonnelIds { get; set; } = new List<string>();

        [BsonElement("planningId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PlanningId { get; set; } = default!;

        /// <summary>
        /// Calcule la durée du créneau.
        /// </summary>
        public TimeSpan Duree => Fin - Debut;
    }
}