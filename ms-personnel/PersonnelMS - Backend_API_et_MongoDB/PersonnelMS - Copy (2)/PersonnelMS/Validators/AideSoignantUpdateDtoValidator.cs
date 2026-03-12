using FluentValidation;
using PersonnelMS.DTOs;
using System.Text.RegularExpressions;

namespace PersonnelMS.Validators
{
    public class AideSoignantUpdateDtoValidator : AbstractValidator<AideSoignantUpdateDto>
    {
        public AideSoignantUpdateDtoValidator()
        {
            RuleFor(x => x.Nom).NotEmpty();
            RuleFor(x => x.Prenom).NotEmpty();
            RuleFor(x => x.Courriel).NotEmpty().EmailAddress();
            RuleFor(x => x.Telephone)
                .Matches(new Regex("^\\+?[0-9]{10,15}$"))
                .When(x => !string.IsNullOrEmpty(x.Telephone));
            RuleFor(x => x.Matricule).NotEmpty();
            RuleFor(x => x.DateEmbauche).NotEmpty();
            RuleFor(x => x.Poste).NotEmpty();
            RuleFor(x => x.Unite).NotEmpty();
        }
    }
}