using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un médecin junior.
    /// </summary>
    [BsonDiscriminator("MedecinJunior")]
    public class MedecinJunior : Medecin
    {
        [BsonElement("promotion")]
        public string Promotion { get; set; } = default!;

        [BsonElement("niveauFormation")]
        public string NiveauFormation { get; set; } = default!;
    }
}