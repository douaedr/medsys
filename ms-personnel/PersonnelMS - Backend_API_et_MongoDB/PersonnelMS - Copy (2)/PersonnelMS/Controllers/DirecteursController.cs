using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DirecteursController : ControllerBase
    {
        private readonly IDirecteurService _service;

        public DirecteursController(IDirecteurService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<DirecteurDto>>> ObtenirTous()
        {
            var liste = await _service.ObtenirTousDirecteursAsync();
            return Ok(liste);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DirecteurDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirDirecteurParIdAsync(id);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<DirecteurDto>> Creer(DirecteurCreateDto dto)
        {
            var created = await _service.CreerDirecteurAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, DirecteurUpdateDto dto)
        {
            await _service.MettreAJourDirecteurAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerDirecteurAsync(id);
            return NoContent();
        }
    }
}