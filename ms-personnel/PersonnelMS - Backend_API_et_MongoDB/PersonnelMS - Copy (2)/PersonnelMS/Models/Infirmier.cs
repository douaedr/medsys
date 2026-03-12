using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un infirmier du personnel.
    /// </summary>
    [BsonDiscriminator("Infirmier")]
    public class Infirmier : Personnel
    {
        [BsonElement("unite")]
        public string Unite { get; set; } = default!;

        [BsonElement("diplome")]
        public string Diplome { get; set; } = default!;
    }
}