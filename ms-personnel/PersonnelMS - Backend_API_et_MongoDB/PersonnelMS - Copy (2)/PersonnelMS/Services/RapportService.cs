using MongoDB.Bson;
using MongoDB.Driver;
using PersonnelMS.DTOs;
using PersonnelMS.Models;
using PersonnelMS.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Implémentation du service de rapports (agrégations MongoDB et calculs métier).
    /// </summary>
    public class RapportService : IRapportService
    {
        private readonly IMongoDatabase _database;
        private readonly IEquipeRepository _equipeRepository;
        private readonly IPlanningRepository _planningRepository;
        private readonly ICreneauRepository _creneauRepository;
        private readonly IAbsenceRepository _absenceRepository;
        private readonly IDemandeModificationRepository _demandeModificationRepository;

        public RapportService(
            IMongoDatabase database,
            IEquipeRepository equipeRepository,
            IPlanningRepository planningRepository,
            ICreneauRepository creneauRepository,
            IAbsenceRepository absenceRepository,
            IDemandeModificationRepository demandeModificationRepository)
        {
            _database = database;
            _equipeRepository = equipeRepository;
            _planningRepository = planningRepository;
            _creneauRepository = creneauRepository;
            _absenceRepository = absenceRepository;
            _demandeModificationRepository = demandeModificationRepository;
        }

        /// <inheritdoc />
        public async Task<List<EffectifParServiceDto>> ObtenirEffectifParServiceAsync()
        {
            var collection = _database.GetCollection<BsonDocument>("Equipe");
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("chefDeServiceId", new BsonDocument("$exists", true).Add("$ne", BsonNull.Value))),
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "Personnel" },
                    { "localField", "chefDeServiceId" },
                    { "foreignField", "_id" },
                    { "as", "chef" }
                }),
                new BsonDocument("$unwind", "$chef"),
                new BsonDocument("$unwind", new BsonDocument("path", "$membreIds").Add("preserveNullAndEmptyArrays", false)),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$chef.serviceNom" },
                    { "membres", new BsonDocument("$addToSet", "$membreIds") }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "service", "$_id" },
                    { "effectif", new BsonDocument("$size", "$membres") }
                })
            };

            var result = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
            return result
                .Select(d => new EffectifParServiceDto
                {
                    Service = d.GetValue("service", "").ToString(),
                    Effectif = d.GetValue("effectif", 0).ToInt32()
                })
                .ToList();
        }

        /// <inheritdoc />
        public async Task<List<AbsencesParMoisDto>> ObtenirAbsencesParMoisAsync(int annee)
        {
            var collection = _database.GetCollection<BsonDocument>("Absence");
            var debutAnnee = new DateTime(annee, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var finAnnee = new DateTime(annee, 12, 31, 23, 59, 59, DateTimeKind.Utc);

            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("dateDebut", new BsonDocument
                {
                    { "$gte", debutAnnee },
                    { "$lte", finAnnee }
                })),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument { { "mois", new BsonDocument("$month", "$dateDebut") }, { "type", "$type" } } },
                    { "total", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "mois", "$_id.mois" },
                    { "type", "$_id.type" },
                    { "total", 1 },
                    { "_id", 0 }
                }),
                new BsonDocument("$sort", new BsonDocument { { "mois", 1 }, { "type", 1 } })
            };

            var result = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
            return result
                .Select(d => new AbsencesParMoisDto
                {
                    Mois = d.GetValue("mois", 0).ToInt32(),
                    Type = d.GetValue("type", "").ToString(),
                    Total = d.GetValue("total", 0).ToInt32()
                })
                .ToList();
        }

        /// <inheritdoc />
        public async Task<TauxOccupationDto> ObtenirTauxOccupationAsync(string? equipeId, DateTime? dateDebut, DateTime? dateFin)
        {
            var plannings = await _planningRepository.ObtenirTousAsync();
            if (equipeId != null)
            {
                plannings = plannings.Where(p => p.EquipeId == equipeId).ToList();
            }
            if (dateDebut.HasValue || dateFin.HasValue)
            {
                plannings = plannings.Where(p =>
                {
                    if (dateDebut.HasValue && p.DateFin < dateDebut.Value) return false;
                    if (dateFin.HasValue && p.DateDebut > dateFin.Value) return false;
                    return true;
                }).ToList();
            }

            var details = new List<DetailTauxOccupationDto>();
            int totalConformes = 0;
            int totalCreneaux = 0;

            foreach (var planning in plannings)
            {
                var equipe = await _equipeRepository.ObtenirParIdAsync(planning.EquipeId);
                if (equipe == null) continue;

                var creneaux = await _creneauRepository.ObtenirCreneauxParPlanningId(planning.Id);
                int conformes = creneaux.Count(c => c.PersonnelIds.Count >= equipe.EffectifMinimum);
                totalConformes += conformes;
                totalCreneaux += creneaux.Count;

                details.Add(new DetailTauxOccupationDto
                {
                    EquipeId = equipe.Id,
                    NomEquipe = equipe.Nom,
                    CreneauxConformes = conformes,
                    TotalCreneaux = creneaux.Count,
                    Taux = creneaux.Count > 0 ? Math.Round(100.0 * conformes / creneaux.Count, 1) : 0
                });
            }

            return new TauxOccupationDto
            {
                TauxGlobal = totalCreneaux > 0 ? Math.Round(100.0 * totalConformes / totalCreneaux, 1) : 0,
                Details = details
            };
        }

        /// <inheritdoc />
        public async Task<RepartitionStatutDto> ObtenirRepartitionStatutAsync()
        {
            var collection = _database.GetCollection<BsonDocument>("Personnel");
            var pipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$statut" },
                    { "count", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$project", new BsonDocument { { "statut", "$_id" }, { "count", 1 }, { "_id", 0 } })
            };

            var result = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
            var parStatut = result.ToDictionary(d => d.GetValue("statut", "").ToString(), d => d.GetValue("count", 0).ToInt32());
            return new RepartitionStatutDto { ParStatut = parStatut };
        }

        /// <inheritdoc />
        public async Task<DemandesEnAttenteDto> ObtenirDemandesEnAttenteAsync(string? chefServiceId = null)
        {
            var absences = await _absenceRepository.ObtenirEnAttenteAsync();
            var demandes = await _demandeModificationRepository.ObtenirEnAttenteAsync();

            if (chefServiceId != null)
            {
                var equipesDuChef = (await _equipeRepository.ObtenirTousAsync())
                    .Where(e => e.ChefDeServiceId == chefServiceId)
                    .Select(e => e.Id)
                    .ToHashSet();
                var planningsDuChef = (await _planningRepository.ObtenirTousAsync())
                    .Where(p => equipesDuChef.Contains(p.EquipeId))
                    .Select(p => p.Id)
                    .ToHashSet();
                var membreIdsDuChef = (await _equipeRepository.ObtenirTousAsync())
                    .Where(e => e.ChefDeServiceId == chefServiceId)
                    .SelectMany(e => e.MembreIds)
                    .ToHashSet();
                absences = absences.Where(a => membreIdsDuChef.Contains(a.PersonnelId)).ToList();
                demandes = demandes.Where(d => membreIdsDuChef.Contains(d.PersonnelId)).ToList();
            }

            return new DemandesEnAttenteDto
            {
                AbsencesEnAttente = absences.Count,
                DemandesModificationEnAttente = demandes.Count
            };
        }
    }
}
