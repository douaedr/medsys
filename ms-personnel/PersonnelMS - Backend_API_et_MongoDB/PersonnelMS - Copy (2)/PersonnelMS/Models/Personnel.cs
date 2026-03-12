using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PersonnelMS.Enums;

using MongoDB.Bson.Serialization.Attributes;

namespace PersonnelMS.Models
{
    /// <summary>
    /// Représente un employé du personnel hospitalier.
    /// </summary>
    [BsonDiscriminator(RootClass = true)]
    [BsonKnownTypes(typeof(Directeur), typeof(Medecin), typeof(MedecinSenior), typeof(MedecinJunior), typeof(ChefDeService), typeof(Infirmier), typeof(InfirmierMajorant), typeof(AideSoignant), typeof(Secretaire), typeof(Brancardier))]
    public class Personnel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("nom")]
        public string Nom { get; set; } = default!;

        [BsonElement("prenom")]
        public string Prenom { get; set; } = default!;

        [BsonElement("courriel")]
        public string Courriel { get; set; } = default!;

        [BsonElement("telephone")]
        public string? Telephone { get; set; }

        [BsonElement("matricule")]
        public string Matricule { get; set; } = default!;

        [BsonElement("statut")]
        [BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public Statut Statut { get; set; }

        [BsonElement("dateEmbauche")]
        public DateTime DateEmbauche { get; set; }

        [BsonElement("poste")]
        public string Poste { get; set; } = default!;
    }
}