using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipesController : ControllerBase
    {
        private readonly IEquipeService _service;

        public EquipesController(IEquipeService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retourne la liste paginée des équipes.
        /// </summary>
        /// <param name="page">Numéro de page (défaut : 1).</param>
        /// <param name="taillePage">Éléments par page (défaut : 20, max : 100).</param>
        /// <param name="trierPar">Propriété de tri : nom, effectifCible, effectifMinimum.</param>
        /// <param name="ordreTri">asc ou desc.</param>
        [HttpGet]
        [ProducesResponseType(typeof(PageResult<EquipeDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PageResult<EquipeDto>>> ObtenirTous(
            [FromQuery] int page = 1,
            [FromQuery] int taillePage = 20,
            [FromQuery] string? trierPar = null,
            [FromQuery] string? ordreTri = null)
        {
            if (taillePage > 100) taillePage = 100;
            if (taillePage < 1) taillePage = 20;
            if (page < 1) page = 1;
            var result = await _service.ObtenirPageAsync(page, taillePage, trierPar, ordreTri);
            return Ok(result);
        }

        /// <summary>
        /// Récupère une équipe par son identifiant.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EquipeDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Crée une nouvelle équipe.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EquipeDto>> Creer(EquipeCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour une équipe existante.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, EquipeUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime une équipe.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Ajoute un membre à l'équipe.
        /// </summary>
        [HttpPost("{id}/membres")]
        public async Task<IActionResult> AjouterMembre(string id, [FromBody] AjoutMembreDto dto)
        {
            await _service.AjouterMembreAsync(id, dto.PersonnelId);
            return NoContent();
        }

        /// <summary>
        /// Retire un membre de l'équipe.
        /// </summary>
        [HttpDelete("{id}/membres/{personnelId}")]
        public async Task<IActionResult> RetirerMembre(string id, string personnelId)
        {
            await _service.RetirerMembreAsync(id, personnelId);
            return NoContent();
        }

        /// <summary>
        /// Vérifie que l'effectif actuel respecte le minimum configuré pour l'équipe.
        /// </summary>
        [HttpGet("{id}/verifier-effectif")]
        public async Task<ActionResult<object>> VerifierEffectif(string id)
        {
            var ok = await _service.VerifierEffectifAsync(id);
            return Ok(new { effectifMinimumAtteint = ok });
        }
    }
}