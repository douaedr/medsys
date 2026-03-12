using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InfirmiersController : ControllerBase
    {
        private readonly IInfirmierService _service;

        public InfirmiersController(IInfirmierService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<InfirmierDto>>> ObtenirTousInfirmiers()
        {
            var liste = await _service.ObtenirTousInfirmiersAsync();
            return Ok(liste);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InfirmierDto>> ObtenirInfirmierParId(string id)
        {
            var dto = await _service.ObtenirInfirmierParIdAsync(id);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<InfirmierDto>> CreerInfirmier(InfirmierCreateDto dto)
        {
            var created = await _service.CreerInfirmierAsync(dto);
            return CreatedAtAction(nameof(ObtenirInfirmierParId), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJourInfirmier(string id, InfirmierUpdateDto dto)
        {
            await _service.MettreAJourInfirmierAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SupprimerInfirmier(string id)
        {
            await _service.SupprimerInfirmierAsync(id);
            return NoContent();
        }
    }
}