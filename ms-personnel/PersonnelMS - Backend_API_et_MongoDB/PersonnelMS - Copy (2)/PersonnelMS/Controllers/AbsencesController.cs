using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using PersonnelMS.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/absences")]
    public class AbsencesController : ControllerBase
    {
        private readonly IAbsenceService _service;

        public AbsencesController(IAbsenceService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retourne la liste de toutes les absences. Des filtres simples peuvent être appliqués via la query string.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<AbsenceDto>>> ObtenirTous([FromQuery] string? personnelId, [FromQuery] StatutAbsence? statut)
        {
            var liste = await _service.ObtenirTousAsync();

            if (!string.IsNullOrEmpty(personnelId))
            {
                liste = liste.FindAll(a => a.PersonnelId == personnelId);
            }

            if (statut.HasValue)
            {
                liste = liste.FindAll(a => a.Statut == statut.Value);
            }

            return Ok(liste);
        }

        /// <summary>
        /// Retourne une absence par identifiant.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AbsenceDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Retourne les absences d'un personnel.
        /// </summary>
        [HttpGet("personnel/{personnelId}")]
        public async Task<ActionResult<List<AbsenceDto>>> ObtenirParPersonnel(string personnelId)
        {
            var liste = await _service.ObtenirParPersonnelIdAsync(personnelId);
            return Ok(liste);
        }

        /// <summary>
        /// Retourne les absences en attente de validation.
        /// </summary>
        [HttpGet("en-attente")]
        public async Task<ActionResult<List<AbsenceDto>>> ObtenirEnAttente()
        {
            var liste = await _service.ObtenirEnAttenteAsync();
            return Ok(liste);
        }

        /// <summary>
        /// Crée une nouvelle demande d'absence.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<AbsenceDto>> Creer(AbsenceCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour une absence existante (uniquement si statut EN_ATTENTE).
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, AbsenceUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime une absence (uniquement si statut EN_ATTENTE).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Approuve une demande d'absence.
        /// </summary>
        [HttpPost("{id}/approuver")]
        public async Task<IActionResult> Approuver(string id, ApprobationDto dto)
        {
            await _service.ApprouverAsync(id, dto.ValideurId, dto.Commentaire);
            return NoContent();
        }

        /// <summary>
        /// Refuse une demande d'absence.
        /// </summary>
        [HttpPost("{id}/refuser")]
        public async Task<IActionResult> Refuser(string id, ApprobationDto dto)
        {
            await _service.RefuserAsync(id, dto.ValideurId, dto.Commentaire);
            return NoContent();
        }

        /// <summary>
        /// Annule une demande d'absence (par le demandeur).
        /// </summary>
        [HttpPost("{id}/annuler")]
        public async Task<IActionResult> Annuler(string id, ApprobationDto dto)
        {
            await _service.AnnulerAsync(id, dto.ValideurId);
            return NoContent();
        }
    }
}

