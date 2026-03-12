using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/demandes-modification")]
    public class DemandesModificationController : ControllerBase
    {
        private readonly IDemandeModificationService _service;

        public DemandesModificationController(IDemandeModificationService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retourne toutes les demandes de modification de planning.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<DemandeModificationDto>>> ObtenirTous()
        {
            var liste = await _service.ObtenirTousAsync();
            return Ok(liste);
        }

        /// <summary>
        /// Retourne une demande de modification par identifiant.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<DemandeModificationDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Retourne les demandes de modification d'un personnel.
        /// </summary>
        [HttpGet("personnel/{personnelId}")]
        public async Task<ActionResult<List<DemandeModificationDto>>> ObtenirParPersonnel(string personnelId)
        {
            var liste = await _service.ObtenirParPersonnelIdAsync(personnelId);
            return Ok(liste);
        }

        /// <summary>
        /// Retourne les demandes de modification en attente.
        /// </summary>
        [HttpGet("en-attente")]
        public async Task<ActionResult<List<DemandeModificationDto>>> ObtenirEnAttente()
        {
            var liste = await _service.ObtenirEnAttenteAsync();
            return Ok(liste);
        }

        /// <summary>
        /// Crée une nouvelle demande de modification de planning.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<DemandeModificationDto>> Creer(DemandeModificationCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour une demande de modification (uniquement si statut EN_ATTENTE).
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, DemandeModificationUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime une demande de modification (uniquement si statut EN_ATTENTE).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Approuve une demande de modification.
        /// </summary>
        [HttpPost("{id}/approuver")]
        public async Task<IActionResult> Approuver(string id, ApprobationDto dto)
        {
            await _service.ApprouverAsync(id, dto.ValideurId, dto.Commentaire);
            return NoContent();
        }

        /// <summary>
        /// Rejette une demande de modification.
        /// </summary>
        [HttpPost("{id}/rejeter")]
        public async Task<IActionResult> Rejeter(string id, ApprobationDto dto)
        {
            await _service.RejeterAsync(id, dto.ValideurId, dto.Commentaire);
            return NoContent();
        }
    }
}

