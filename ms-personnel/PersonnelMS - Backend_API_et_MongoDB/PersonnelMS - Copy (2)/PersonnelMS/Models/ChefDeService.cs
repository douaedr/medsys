using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un chef de service (médecin senior avec service).
    /// </summary>
    [BsonDiscriminator("ChefDeService")]
    public class ChefDeService : MedecinSenior
    {
        [BsonElement("serviceNom")]
        public string ServiceNom { get; set; } = default!;
    }
}