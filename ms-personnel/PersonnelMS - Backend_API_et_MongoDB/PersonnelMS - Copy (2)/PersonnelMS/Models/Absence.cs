using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;
using System;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente une demande d'absence d'un membre du personnel.
    /// </summary>
    public class Absence
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("type")]
        [BsonRepresentation(BsonType.String)]
        public TypeAbsence Type { get; set; }

        [BsonElement("dateDebut")]
        public DateTime DateDebut { get; set; }

        [BsonElement("dateFin")]
        public DateTime DateFin { get; set; }

        [BsonElement("motif")]
        public string Motif { get; set; } = default!;

        [BsonElement("statut")]
        [BsonRepresentation(BsonType.String)]
        public StatutAbsence Statut { get; set; }

        [BsonElement("justificatif")]
        public string? Justificatif { get; set; }

        [BsonElement("personnelId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonnelId { get; set; } = default!;

        [BsonElement("valideurId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ValideurId { get; set; }
    }
}

