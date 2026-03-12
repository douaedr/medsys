using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un médecin senior.
    /// </summary>
    [BsonDiscriminator("MedecinSenior")]
    public class MedecinSenior : Medecin
    {
        // Aucun attribut supplémentaire pour l'instant.
    }
}