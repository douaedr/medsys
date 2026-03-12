using FluentValidation;
using PersonnelMS.DTOs;

namespace PersonnelMS.Validators
{
    public class EquipeCreateDtoValidator : AbstractValidator<EquipeCreateDto>
    {
        public EquipeCreateDtoValidator()
        {
            RuleFor(x => x.Nom).NotEmpty();
            RuleFor(x => x.Periodicite).IsInEnum();
            RuleFor(x => x.EffectifCible).GreaterThan(0);
            RuleFor(x => x.EffectifMinimum).GreaterThan(0)
                .LessThanOrEqualTo(x => x.EffectifCible)
                .WithMessage("L'effectif minimum doit être inférieur ou égal à l'effectif cible.");
            RuleFor(x => x.ChefEquipeId).NotEmpty();
        }
    }
}