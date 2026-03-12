using FluentValidation;
using PersonnelMS.DTOs;

namespace PersonnelMS.Validators
{
    public class CreneauCreateDtoValidator : AbstractValidator<CreneauCreateDto>
    {
        public CreneauCreateDtoValidator()
        {
            RuleFor(x => x.Debut).NotEmpty();
            RuleFor(x => x.Fin).GreaterThan(x => x.Debut)
                .WithMessage("La fin doit être postérieure au début.");
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.Statut).IsInEnum();
            RuleFor(x => x.Lieu).NotEmpty();
            RuleFor(x => x.PlanningId).NotEmpty();
        }
    }
}