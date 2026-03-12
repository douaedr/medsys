using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrancardiersController : ControllerBase
    {
        private readonly IBrancardierService _service;

        public BrancardiersController(IBrancardierService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<BrancardierDto>>> ObtenirTous()
        {
            var liste = await _service.ObtenirTousBrancardiersAsync();
            return Ok(liste);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BrancardierDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirBrancardierParIdAsync(id);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<BrancardierDto>> Creer(BrancardierCreateDto dto)
        {
            var created = await _service.CreerBrancardierAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, BrancardierUpdateDto dto)
        {
            await _service.MettreAJourBrancardierAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerBrancardierAsync(id);
            return NoContent();
        }
    }
}