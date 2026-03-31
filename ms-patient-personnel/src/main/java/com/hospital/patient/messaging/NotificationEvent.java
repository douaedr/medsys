package com.hospital.patient.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound notification event published to the patient exchange.
 * Consumed by any notification service (.NET or other).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    @JsonProperty("eventType")
    private String eventType;   // PATIENT_NOTIFICATION

    @JsonProperty("patientId")
    private Long patientId;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("message")
    private String message;

    @JsonProperty("appointmentId")
    private Long appointmentId;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
}
