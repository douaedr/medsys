using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un aide-soignant.
    /// </summary>
    [BsonDiscriminator("AideSoignant")]
    public class AideSoignant : Personnel
    {
        [BsonElement("unite")]
        public string Unite { get; set; } = default!;
    }
}