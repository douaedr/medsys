using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un directeur du personnel hospitalier.
    /// </summary>
    [BsonDiscriminator("Directeur")]
    public class Directeur : Personnel
    {
        // Aucun attribut additionnel pour l'instant.
    }
}