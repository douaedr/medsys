package com.hospital.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDashboardDTO {
    private PatientResponseDTO profile;
    private List<AppointmentRecordDTO> upcomingAppointments;
    private List<AppointmentRecordDTO> pastAppointments;
    private DashboardStatsDTO statistics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsDTO {
        private long totalAppointments;
        private long upcomingCount;
        private long completedCount;
        private long cancelledCount;
        private long favoriteDoctorsCount;
        private long unreadMessages;
    }
}
