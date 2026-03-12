using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;
using System;
using System.Collections.Generic;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un planning associé à une équipe.
    /// </summary>
    public class Planning
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("nom")]
        public string Nom { get; set; } = default!;

        [BsonElement("dateDebut")]
        public DateTime DateDebut { get; set; }

        [BsonElement("dateFin")]
        public DateTime DateFin { get; set; }

        [BsonElement("statut")]
        [BsonRepresentation(BsonType.String)]
        public StatutPlanning Statut { get; set; }

        [BsonElement("equipeId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string EquipeId { get; set; } = default!;
    }
}