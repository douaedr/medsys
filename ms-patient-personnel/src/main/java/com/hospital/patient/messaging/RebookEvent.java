package com.hospital.patient.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RebookEvent {

    @JsonProperty("eventType")
    private String eventType;

    @JsonProperty("patientId")
    private Long patientId;

    @JsonProperty("originalAppointmentId")
    private String originalAppointmentId;

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