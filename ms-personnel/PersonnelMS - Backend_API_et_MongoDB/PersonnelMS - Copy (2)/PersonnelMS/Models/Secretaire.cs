using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente une secrétaire.
    /// </summary>
    [BsonDiscriminator("Secretaire")]
    public class Secretaire : Personnel
    {
        // Aucun attribut supplémentaire.
    }
}