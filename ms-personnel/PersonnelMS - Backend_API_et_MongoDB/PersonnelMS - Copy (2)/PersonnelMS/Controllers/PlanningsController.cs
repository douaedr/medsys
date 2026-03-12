using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlanningsController : ControllerBase
    {
        private readonly IPlanningService _service;
        public PlanningsController(IPlanningService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retourne la liste paginée des plannings.
        /// </summary>
        /// <param name="page">Numéro de page (défaut : 1).</param>
        /// <param name="taillePage">Éléments par page (défaut : 20, max : 100).</param>
        /// <param name="trierPar">Propriété de tri : nom, dateDebut, dateFin, statut.</param>
        /// <param name="ordreTri">asc ou desc.</param>
        /// <param name="equipeId">Filtre par équipe.</param>
        /// <param name="statut">Filtre par statut.</param>
        [HttpGet]
        [ProducesResponseType(typeof(PageResult<PlanningDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PageResult<PlanningDto>>> ObtenirTous(
            [FromQuery] int page = 1,
            [FromQuery] int taillePage = 20,
            [FromQuery] string? trierPar = null,
            [FromQuery] string? ordreTri = null,
            [FromQuery] string? equipeId = null,
            [FromQuery] PersonnelMS.Enums.StatutPlanning? statut = null)
        {
            if (taillePage > 100) taillePage = 100;
            if (taillePage < 1) taillePage = 20;
            if (page < 1) page = 1;
            var result = await _service.ObtenirPageAsync(page, taillePage, trierPar, ordreTri, equipeId, statut);
            return Ok(result);
        }

        /// <summary>
        /// Récupère un planning par identifiant.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PlanningDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Crée un nouveau planning.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PlanningDto>> Creer(PlanningCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour un planning existant.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, PlanningUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime un planning.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Passe le planning en validation (BROUILLON → EN_VALIDATION).
        /// </summary>
        [HttpPost("{id}/en-validation")]
        public async Task<IActionResult> MettreEnValidation(string id, RequeteActionDto requete)
        {
            await _service.MettreEnValidationAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Valide le planning (EN_VALIDATION → VALIDE).
        /// </summary>
        [HttpPost("{id}/valider")]
        public async Task<IActionResult> Valider(string id, RequeteActionDto requete)
        {
            await _service.ValiderAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Publie le planning (VALIDE → PUBLIE).
        /// </summary>
        [HttpPost("{id}/publier")]
        public async Task<IActionResult> Publier(string id, RequeteActionDto requete)
        {
            await _service.PublierAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Archive le planning (VALIDE ou PUBLIE → ARCHIVE).
        /// </summary>
        [HttpPost("{id}/archiver")]
        public async Task<IActionResult> Archiver(string id, RequeteActionDto requete)
        {
            await _service.ArchiverAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Vérifie la présence de conflits de personnel dans le planning.
        /// </summary>
        [HttpGet("{id}/conflits")]
        public async Task<ActionResult<object>> Conflits(string id)
        {
            var has = await _service.DetecterConflitsAsync(id);
            return Ok(new { conflits = has });
        }

        /// <summary>
        /// Vérifie que chaque créneau du planning atteint l'effectif minimum de l'équipe.
        /// </summary>
        [HttpGet("{id}/couverture")]
        public async Task<ActionResult<object>> Couverture(string id)
        {
            var ok = await _service.VerifierCouvertureAsync(id);
            return Ok(new { couvertureSuffisante = ok });
        }
    }
}