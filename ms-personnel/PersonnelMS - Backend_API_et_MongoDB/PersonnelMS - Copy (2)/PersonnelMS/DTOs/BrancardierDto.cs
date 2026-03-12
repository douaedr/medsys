namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour un brancardier.
    /// </summary>
    public class BrancardierDto : PersonnelDto
    {
        public string ZoneCouverture { get; set; } = default!;
    }
}