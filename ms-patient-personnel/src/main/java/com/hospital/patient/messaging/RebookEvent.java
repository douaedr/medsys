package com.hospital.patient.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Published when a patient requests to rebook a previous appointment.
 * The appointment microservice (.NET) consumes this event and creates
 * the new appointment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RebookEvent {

    @JsonProperty("eventType")
    private String eventType;   // APPOINTMENT_REBOOK_REQUESTED

    @JsonProperty("patientId")
    private Long patientId;

    @JsonProperty("originalAppointmentId")
    private Long originalAppointmentId;

    @JsonProperty("doctorId")
    private Long doctorId;

    @JsonProperty("doctorName")
    private String doctorName;

    @JsonProperty("specialty")
    private String specialty;

    @JsonProperty("notes")
    private String notes;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
}
