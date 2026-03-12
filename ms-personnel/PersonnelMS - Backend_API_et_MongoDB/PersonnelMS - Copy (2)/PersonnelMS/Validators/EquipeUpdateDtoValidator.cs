using FluentValidation;
using PersonnelMS.DTOs;

namespace PersonnelMS.Validators
{
    public class EquipeUpdateDtoValidator : AbstractValidator<EquipeUpdateDto>
    {
        public EquipeUpdateDtoValidator()
        {
            RuleFor(x => x.Nom).NotEmpty();
            // Autorise la valeur 0 (première valeur de l'énumération) et vérifie simplement qu'elle fait partie de l'énum.
            RuleFor(x => x.Periodicite).IsInEnum();
            RuleFor(x => x.EffectifCible).GreaterThan(0);
            RuleFor(x => x.EffectifMinimum).GreaterThan(0)
                .LessThanOrEqualTo(x => x.EffectifCible)
                .WithMessage("L'effectif minimum doit être inférieur ou égal à l'effectif cible.");
            RuleFor(x => x.ChefEquipeId).NotEmpty();
        }
    }
}