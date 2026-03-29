namespace MedicalAppointments.API.DTOs.Slot;

public record CreateSlotDto(
    DateTime StartTime,
    DateTime EndTime
);

public record CreateBulkSlotsDto(
    DateOnly   WeekStartDate,
    TimeOnly   SlotStartTime,
    TimeOnly   SlotEndTime,
    int        SlotDurationMinutes,
    DayOfWeek[] WorkDays
);

public record TimeSlotResponseDto(
    int      Id,
    DateTime StartTime,
    DateTime EndTime,
    string   Status,
    bool     IsClickable
);
