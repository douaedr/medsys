namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour un aide-soignant.
    /// </summary>
    public class AideSoignantDto : PersonnelDto
    {
        public string Unite { get; set; } = default!;
    }
}