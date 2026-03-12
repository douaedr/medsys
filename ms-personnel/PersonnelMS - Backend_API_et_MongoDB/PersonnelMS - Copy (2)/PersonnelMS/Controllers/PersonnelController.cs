using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Services;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class PersonnelController : ControllerBase
    {
        private readonly IServicePersonnel _service;

        public PersonnelController(IServicePersonnel service)
        {
            _service = service;
        }

        /// <summary>
        /// Récupère la liste paginée des personnels.
        /// </summary>
        /// <param name="page">Numéro de page (défaut : 1).</param>
        /// <param name="taillePage">Nombre d'éléments par page (défaut : 20, max : 100).</param>
        /// <param name="trierPar">Propriété de tri (nom, prenom, courriel, matricule, statut, dateEmbauche, poste).</param>
        /// <param name="ordreTri">Ordre : asc ou desc.</param>
        /// <param name="statut">Filtre par statut.</param>
        /// <response code="200">Page de personnels.</response>
        /// <response code="500">Erreur serveur.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PageResult<PersonnelDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PageResult<PersonnelDto>>> ObtenirTous(
            [FromQuery] int page = 1,
            [FromQuery] int taillePage = 20,
            [FromQuery] string? trierPar = null,
            [FromQuery] string? ordreTri = null,
            [FromQuery] Statut? statut = null)
        {
            if (taillePage > 100) taillePage = 100;
            if (taillePage < 1) taillePage = 20;
            if (page < 1) page = 1;
            var result = await _service.ObtenirPageAsync(page, taillePage, trierPar, ordreTri, statut);
            return Ok(result);
        }

        /// <summary>
        /// Récupère un personnel par son identifiant.
        /// </summary>
        /// <response code="200">Personnel trouvé.</response>
        /// <response code="404">Personnel introuvable.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PersonnelDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PersonnelDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Crée un nouveau personnel.
        /// </summary>
        /// <response code="201">Personnel créé.</response>
        /// <response code="400">Données invalides.</response>
        /// <response code="409">Conflit (courriel ou matricule déjà utilisé).</response>
        [HttpPost]
        [ProducesResponseType(typeof(PersonnelDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PersonnelDto>> Creer(PersonnelCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour un personnel existant.
        /// </summary>
        /// <response code="204">Mise à jour effectuée.</response>
        /// <response code="404">Personnel introuvable.</response>
        /// <response code="409">Conflit.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> MettreAJour(string id, PersonnelUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime un personnel.
        /// </summary>
        /// <response code="204">Suppression effectuée.</response>
        /// <response code="404">Personnel introuvable.</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }
    }
}