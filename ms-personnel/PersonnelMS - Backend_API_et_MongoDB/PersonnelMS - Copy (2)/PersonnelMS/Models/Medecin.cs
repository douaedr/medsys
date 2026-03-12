using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un médecin du personnel.
    /// </summary>
    [BsonDiscriminator("Medecin")]
    public class Medecin : Personnel
    {
        [BsonElement("specialite")]
        public string Specialite { get; set; } = default!;

        [BsonElement("numeroOrdre")]
        public string NumeroOrdre { get; set; } = default!;

        [BsonElement("titresProfessionnels")]
        public string? TitresProfessionnels { get; set; }
    }
}