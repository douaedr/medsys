namespace MedicalAppointments.API.Models;

public enum SlotStatus { Available, Reserved, Cancelled, Blocked }

public class TimeSlot
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public SlotStatus Status { get; set; } = SlotStatus.Available;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Doctor { get; set; } = default!;
    public Appointment? Appointment { get; set; }
}
