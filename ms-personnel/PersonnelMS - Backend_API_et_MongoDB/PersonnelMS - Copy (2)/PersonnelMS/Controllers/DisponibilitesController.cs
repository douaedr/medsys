using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/disponibilites")]
    public class DisponibilitesController : ControllerBase
    {
        private readonly IDisponibiliteService _service;

        public DisponibilitesController(IDisponibiliteService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retourne toutes les disponibilités déclarées.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<DisponibiliteDto>>> ObtenirTous()
        {
            var liste = await _service.ObtenirTousAsync();
            return Ok(liste);
        }

        /// <summary>
        /// Retourne une disponibilité par son identifiant.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<DisponibiliteDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Retourne les disponibilités d'un personnel donné.
        /// </summary>
        [HttpGet("personnel/{personnelId}")]
        public async Task<ActionResult<List<DisponibiliteDto>>> ObtenirParPersonnel(string personnelId)
        {
            var liste = await _service.ObtenirParPersonnelIdAsync(personnelId);
            return Ok(liste);
        }

        /// <summary>
        /// Crée une nouvelle disponibilité.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<DisponibiliteDto>> Creer(DisponibiliteCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour une disponibilité existante.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, DisponibiliteUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime une disponibilité.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }
    }
}

