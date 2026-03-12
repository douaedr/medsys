namespace PersonnelMS.DTOs
{
    /// <summary>
    /// DTO pour un chef de service.
    /// </summary>
    public class ChefDeServiceDto : MedecinSeniorDto
    {
        public string ServiceNom { get; set; } = default!;
    }
}