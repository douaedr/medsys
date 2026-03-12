using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SecretairesController : ControllerBase
    {
        private readonly ISecretaireService _service;

        public SecretairesController(ISecretaireService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<SecretaireDto>>> ObtenirToutes()
        {
            var liste = await _service.ObtenirToutesSecretairesAsync();
            return Ok(liste);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SecretaireDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirSecretaireParIdAsync(id);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<SecretaireDto>> Creer(SecretaireCreateDto dto)
        {
            var created = await _service.CreerSecretaireAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, SecretaireUpdateDto dto)
        {
            await _service.MettreAJourSecretaireAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerSecretaireAsync(id);
            return NoContent();
        }
    }
}