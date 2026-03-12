using FluentValidation;
using PersonnelMS.DTOs;
using PersonnelMS.Enums;
using System.Text.RegularExpressions;

namespace PersonnelMS.Validators
{
    public class MedecinUpdateDtoValidator : AbstractValidator<MedecinUpdateDto>
    {
        public MedecinUpdateDtoValidator()
        {
            RuleFor(x => x.Type).IsInEnum();

            RuleFor(x => x.Nom).NotEmpty();
            RuleFor(x => x.Prenom).NotEmpty();
            RuleFor(x => x.Courriel).NotEmpty().EmailAddress();
            RuleFor(x => x.Telephone)
                .Matches(new Regex("^\\+?[0-9]{10,15}$"))
                .When(x => !string.IsNullOrEmpty(x.Telephone));
            RuleFor(x => x.Matricule).NotEmpty();
            RuleFor(x => x.DateEmbauche).NotEmpty();
            RuleFor(x => x.Poste).NotEmpty();

            RuleFor(x => x.Specialite).NotEmpty();
            RuleFor(x => x.NumeroOrdre).NotEmpty();

            When(x => x.Type == TypeMedecin.Junior, () =>
            {
                RuleFor(x => x.Promotion).NotEmpty();
                RuleFor(x => x.NiveauFormation).NotEmpty();
            });

            When(x => x.Type == TypeMedecin.ChefDeService, () =>
            {
                RuleFor(x => x.ServiceNom).NotEmpty();
            });
        }
    }
}