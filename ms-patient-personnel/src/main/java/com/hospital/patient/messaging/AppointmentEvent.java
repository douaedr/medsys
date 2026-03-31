package com.hospital.patient.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Inbound event received from the appointment microservice (.NET or other).
 * camelCase naming for .NET interoperability.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEvent {

    @JsonProperty("eventType")
    private String eventType;   // APPOINTMENT_CREATED | APPOINTMENT_CANCELLED

    @JsonProperty("appointmentId")
    private Long appointmentId;

    @JsonProperty("patientId")
    private Long patientId;

    @JsonProperty("doctorId")
    private Long doctorId;

    @JsonProperty("doctorName")
    private String doctorName;

    @JsonProperty("specialty")
    private String specialty;

    @JsonProperty("appointmentDate")
    private LocalDateTime appointmentDate;

    @JsonProperty("notes")
    private String notes;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
}
