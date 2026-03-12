using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;
using System.Collections.Generic;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente une équipe de soins.
    /// </summary>
    public class Equipe
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("nom")]
        public string Nom { get; set; } = default!;

        [BsonElement("periodicite")]
        [BsonRepresentation(BsonType.String)]
        public Periodicite Periodicite { get; set; }

        [BsonElement("effectifCible")]
        public int EffectifCible { get; set; }

        [BsonElement("effectifMinimum")]
        public int EffectifMinimum { get; set; }

        [BsonElement("chefEquipeId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ChefEquipeId { get; set; }

        [BsonElement("encadrantId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? EncadrantId { get; set; }

        [BsonElement("membreIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string> MembreIds { get; set; } = new List<string>();

        [BsonElement("chefDeServiceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ChefDeServiceId { get; set; }

        /// <summary>
        /// Vérifie si l'effectif actuel respecte la fourchette [Minimum, Cible].
        /// </summary>
        public bool VerifierEffectif()
        {
            var count = MembreIds?.Count ?? 0;
            return count >= EffectifMinimum && count <= EffectifCible;
        }
    }
}