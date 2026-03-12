namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour un infirmier.
    /// </summary>
    public class InfirmierDto : PersonnelDto
    {
        public string Unite { get; set; } = default!;
        public string Diplome { get; set; } = default!;
    }
}