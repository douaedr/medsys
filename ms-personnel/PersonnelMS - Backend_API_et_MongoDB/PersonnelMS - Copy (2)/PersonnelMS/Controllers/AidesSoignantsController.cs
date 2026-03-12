using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AidesSoignantsController : ControllerBase
    {
        private readonly IAideSoignantService _service;

        public AidesSoignantsController(IAideSoignantService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<AideSoignantDto>>> ObtenirTous()
        {
            var liste = await _service.ObtenirTousAidesAsync();
            return Ok(liste);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AideSoignantDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirAideParIdAsync(id);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<AideSoignantDto>> Creer(AideSoignantCreateDto dto)
        {
            var created = await _service.CreerAideAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, AideSoignantUpdateDto dto)
        {
            await _service.MettreAJourAideAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAideAsync(id);
            return NoContent();
        }
    }
}