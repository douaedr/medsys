using FluentValidation;
using PersonnelMS.DTOs;

namespace PersonnelMS.Validators
{
    public class CreneauUpdateDtoValidator : AbstractValidator<CreneauUpdateDto>
    {
        public CreneauUpdateDtoValidator()
        {
            RuleFor(x => x.Debut).NotEmpty();
            RuleFor(x => x.Fin).GreaterThan(x => x.Debut)
                .WithMessage("La fin doit être postérieure au début.");
            RuleFor(x => x.Type).NotEmpty();
            RuleFor(x => x.Statut).NotEmpty();
            RuleFor(x => x.Lieu).NotEmpty();
            RuleFor(x => x.PlanningId).NotEmpty();
        }
    }
}