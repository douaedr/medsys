using Microsoft.AspNetCore.Mvc;
using PersonnelMS.DTOs;
using PersonnelMS.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreneauxController : ControllerBase
    {
        private readonly ICreneauService _service;

        public CreneauxController(ICreneauService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retourne la liste des créneaux. Des filtres peuvent être appliqués en query string.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<CreneauDto>>> ObtenirTous([FromQuery] string? planningId, [FromQuery] string? personnelId, [FromQuery] DateTime? dateDebut, [FromQuery] DateTime? dateFin)
        {
            var liste = await _service.ObtenirTousAsync();
            // filtres simples en mémoire
            if (!string.IsNullOrEmpty(planningId))
                liste = liste.FindAll(c => c.PlanningId == planningId);
            if (!string.IsNullOrEmpty(personnelId))
                liste = liste.FindAll(c => c.PersonnelIds.Contains(personnelId));
            if (dateDebut.HasValue)
                liste = liste.FindAll(c => c.Debut >= dateDebut.Value);
            if (dateFin.HasValue)
                liste = liste.FindAll(c => c.Fin <= dateFin.Value);
            return Ok(liste);
        }

        /// <summary>
        /// Récupère un créneau par identifiant.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CreneauDto>> ObtenirParId(string id)
        {
            var dto = await _service.ObtenirParIdAsync(id);
            return Ok(dto);
        }

        /// <summary>
        /// Crée un nouveau créneau.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CreneauDto>> Creer(CreneauCreateDto dto)
        {
            var created = await _service.CreerAsync(dto);
            return CreatedAtAction(nameof(ObtenirParId), new { id = created.Id }, created);
        }

        /// <summary>
        /// Met à jour un créneau existant.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> MettreAJour(string id, CreneauUpdateDto dto)
        {
            await _service.MettreAJourAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Supprime un créneau.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Supprimer(string id)
        {
            await _service.SupprimerAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Affecte un personnel (par Id) au créneau.
        /// </summary>
        [HttpPost("{id}/affecter")]
        public async Task<IActionResult> Affecter(string id, AffectationCreneauDto requete)
        {
            await _service.AffecterPersonnelAsync(id, requete.PersonnelId, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Retire un personnel affecté du créneau.
        /// </summary>
        [HttpDelete("{id}/affecter/{personnelId}")]
        public async Task<IActionResult> Retirer(string id, string personnelId, [FromBody] RequeteActionDto requete)
        {
            await _service.RetirerPersonnelAsync(id, personnelId, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Confirme un créneau (statut PREVISIONNEL → CONFIRME).
        /// </summary>
        [HttpPost("{id}/confirmer")]
        public async Task<IActionResult> Confirmer(string id, RequeteActionDto requete)
        {
            await _service.ConfirmerAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Démarre un créneau (statut CONFIRME → EN_COURS).
        /// </summary>
        [HttpPost("{id}/commencer")]
        public async Task<IActionResult> Commencer(string id, RequeteActionDto requete)
        {
            await _service.CommencerAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Termine un créneau (statut EN_COURS → TERMINE).
        /// </summary>
        [HttpPost("{id}/terminer")]
        public async Task<IActionResult> Terminer(string id, RequeteActionDto requete)
        {
            await _service.TerminerAsync(id, requete.UtilisateurId);
            return NoContent();
        }

        /// <summary>
        /// Annule un créneau (tous états sauf TERMINE → ANNULE).
        /// </summary>
        [HttpPost("{id}/annuler")]
        public async Task<IActionResult> Annuler(string id, RequeteActionDto requete)
        {
            await _service.AnnulerAsync(id, requete.UtilisateurId);
            return NoContent();
        }
    }
}