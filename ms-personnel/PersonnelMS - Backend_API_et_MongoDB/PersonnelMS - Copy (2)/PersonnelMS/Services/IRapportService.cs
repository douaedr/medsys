using PersonnelMS.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonnelMS.Services
{
    /// <summary>
    /// Service de génération des rapports et statistiques.
    /// </summary>
    public interface IRapportService
    {
        /// <summary>
        /// Effectif par service (équipes gérées par un chef de service).
        /// </summary>
        Task<List<EffectifParServiceDto>> ObtenirEffectifParServiceAsync();

        /// <summary>
        /// Nombre d'absences par mois et par type pour une année.
        /// </summary>
        Task<List<AbsencesParMoisDto>> ObtenirAbsencesParMoisAsync(int annee);

        /// <summary>
        /// Taux d'occupation des créneaux (effectif minimum atteint).
        /// </summary>
        Task<TauxOccupationDto> ObtenirTauxOccupationAsync(string? equipeId, DateTime? dateDebut, DateTime? dateFin);

        /// <summary>
        /// Répartition des personnels par statut.
        /// </summary>
        Task<RepartitionStatutDto> ObtenirRepartitionStatutAsync();

        /// <summary>
        /// Nombre de demandes (absences et modifications) en attente.
        /// </summary>
        Task<DemandesEnAttenteDto> ObtenirDemandesEnAttenteAsync(string? chefServiceId = null);
    }
}
