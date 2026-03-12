using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un infirmier majorant.
    /// </summary>
    [BsonDiscriminator("InfirmierMajorant")]
    public class InfirmierMajorant : Infirmier
    {
        // Pas d'attributs supplémentaires.
    }
}