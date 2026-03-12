namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour un médecin junior.
    /// </summary>
    public class MedecinJuniorDto : MedecinDto
    {
        public string Promotion { get; set; } = default!;
        public string NiveauFormation { get; set; } = default!;
    }
}