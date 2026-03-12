using FluentValidation;
using PersonnelMS.DTOs;

namespace PersonnelMS.Validators
{
    public class PlanningUpdateDtoValidator : AbstractValidator<PlanningUpdateDto>
    {
        public PlanningUpdateDtoValidator()
        {
            RuleFor(x => x.Nom).NotEmpty();
            RuleFor(x => x.DateDebut).NotEmpty();
            RuleFor(x => x.DateFin).GreaterThan(x => x.DateDebut)
                .WithMessage("La date de fin doit être postérieure à la date de début.");
            RuleFor(x => x.Statut).NotEmpty();
            RuleFor(x => x.EquipeId).NotEmpty();
        }
    }
}