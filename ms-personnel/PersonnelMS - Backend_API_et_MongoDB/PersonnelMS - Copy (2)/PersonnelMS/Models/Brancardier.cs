using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un brancardier.
    /// </summary>
    [BsonDiscriminator("Brancardier")]
    public class Brancardier : Personnel
    {
        [BsonElement("zoneCouverture")]
        public string ZoneCouverture { get; set; } = default!;
    }
}