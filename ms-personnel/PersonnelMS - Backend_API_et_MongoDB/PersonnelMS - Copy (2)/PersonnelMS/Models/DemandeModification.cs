using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;
using System;
using System.Collections.Generic;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente une demande de modification de planning.
    /// </summary>
    public class DemandeModification
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("type")]
        [BsonRepresentation(BsonType.String)]
        public TypeModification Type { get; set; }

        [BsonElement("motif")]
        public string Motif { get; set; } = default!;

        [BsonElement("statut")]
        [BsonRepresentation(BsonType.String)]
        public StatutDemande Statut { get; set; }

        [BsonElement("dateDemande")]
        public DateTime DateDemande { get; set; }

        [BsonElement("personnelId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonnelId { get; set; } = default!;

        [BsonElement("traiteurId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? TraiteurId { get; set; }

        [BsonElement("creneauIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string>? CreneauIds { get; set; }
    }
}

