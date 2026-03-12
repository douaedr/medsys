using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedecinsController : ControllerBase
    {
        private readonly IMedecinService _service;

        public MedecinsController(IMedecinService service)
        {
            _service = service;
        }

        /// <summary>
        /// Récupère tous les médecins (tous types confondus : junior, senior, chef de service).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<MedecinDto>>> ObtenirTousMedecins()
        {
            var liste = await _service.ObtenirTousMedecinsAsync();
            return Ok(liste);
        }

        /// <summary>
        /// Récupère un médecin par id. Si l'entité existe mais n'est pas un médecin, retourne 404.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<MedecinDto>> ObtenirMedecinParId(string id)
        {
            var dto = await _service.ObtenirMedecinParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Crée un nouveau médecin (le champ Type du DTO indique la sous-classe souhaitée).
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<MedecinDto>> CreerMedecin(MedecinCreateDto dto)
        {
            var created = await _service.CreerMedecinAsync(dto);
            return CreatedAtAction(nameof(ObtenirMedecinParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour un médecin existant.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJourMedecin(string id, MedecinUpdateDto dto)
        {
            await _service.MettreAJourMedecinAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime un médecin.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> SupprimerMedecin(string id)
        {
            await _service.SupprimerMedecinAsync(id);
            return NoContent();
        }
    }
}