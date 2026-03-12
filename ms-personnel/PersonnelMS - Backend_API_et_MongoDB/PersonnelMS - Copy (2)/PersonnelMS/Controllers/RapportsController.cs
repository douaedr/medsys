using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    /// <summary>
    /// Endpoints de reporting et statistiques.
    /// </summary>
    [ApiController]
    [Route("api/rapports")]
    [Produces("application/json")]
    public class RapportsController : ControllerBase
    {
        private readonly IRapportService _rapportService;

        public RapportsController(IRapportService rapportService)
        {
            _rapportService = rapportService;
        }

        /// <summary>
        /// Effectif par service (équipes gérées par un chef de service).
        /// </summary>
        /// <response code="200">Liste des effectifs par service.</response>
        /// <response code="500">Erreur serveur.</response>
        [HttpGet("effectif-par-service")]
        [ProducesResponseType(typeof(List<EffectifParServiceDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<List<EffectifParServiceDto>>> EffectifParService()
        {
            var result = await _rapportService.ObtenirEffectifParServiceAsync();
            return Ok(result);
        }

        /// <summary>
        /// Nombre d'absences par mois et par type pour une année.
        /// </summary>
        /// <param name="annee">Année (défaut : année courante).</param>
        /// <response code="200">Liste des totaux par mois et type.</response>
        /// <response code="500">Erreur serveur.</response>
        [HttpGet("absences-par-mois")]
        [ProducesResponseType(typeof(List<AbsencesParMoisDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<List<AbsencesParMoisDto>>> AbsencesParMois([FromQuery] int? annee = null)
        {
            var an = annee ?? DateTime.UtcNow.Year;
            var result = await _rapportService.ObtenirAbsencesParMoisAsync(an);
            return Ok(result);
        }

        /// <summary>
        /// Taux d'occupation des créneaux (part des créneaux où l'effectif minimum est atteint).
        /// </summary>
        /// <param name="equipeId">Filtre optionnel par équipe.</param>
        /// <param name="dateDebut">Début de période optionnel.</param>
        /// <param name="dateFin">Fin de période optionnelle.</param>
        /// <response code="200">Taux global et détails par équipe.</response>
        /// <response code="500">Erreur serveur.</response>
        [HttpGet("taux-occupation")]
        [ProducesResponseType(typeof(TauxOccupationDto), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<TauxOccupationDto>> TauxOccupation(
            [FromQuery] string? equipeId = null,
            [FromQuery] DateTime? dateDebut = null,
            [FromQuery] DateTime? dateFin = null)
        {
            var result = await _rapportService.ObtenirTauxOccupationAsync(equipeId, dateDebut, dateFin);
            return Ok(result);
        }

        /// <summary>
        /// Répartition des personnels par statut (ACTIF, EN_CONGE, etc.).
        /// </summary>
        /// <response code="200">Dictionnaire statut → effectif.</response>
        /// <response code="500">Erreur serveur.</response>
        [HttpGet("repartition-statut")]
        [ProducesResponseType(typeof(RepartitionStatutDto), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<RepartitionStatutDto>> RepartitionStatut()
        {
            var result = await _rapportService.ObtenirRepartitionStatutAsync();
            return Ok(result);
        }

        /// <summary>
        /// Nombre de demandes (absences et modifications) en attente. Optionnellement filtré par chef de service.
        /// </summary>
        /// <param name="chefServiceId">Identifiant du chef de service pour filtrer les demandes de son périmètre.</param>
        /// <response code="200">Absences et demandes de modification en attente.</response>
        /// <response code="500">Erreur serveur.</response>
        [HttpGet("demandes-en-attente")]
        [ProducesResponseType(typeof(DemandesEnAttenteDto), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<DemandesEnAttenteDto>> DemandesEnAttente([FromQuery] string? chefServiceId = null)
        {
            var result = await _rapportService.ObtenirDemandesEnAttenteAsync(chefServiceId);
            return Ok(result);
        }
    }
}
