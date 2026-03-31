package com.hospital.auth.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JSON event published to RabbitMQ. Field names use camelCase for
 * .NET interoperability (no Java-specific serialization).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthEventMessage {

    @JsonProperty("eventType")
    private String eventType;       // USER_CREATED | USER_LOGGED_IN

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("email")
    private String email;

    @JsonProperty("role")
    private String role;

    @JsonProperty("nom")
    private String nom;

    @JsonProperty("prenom")
    private String prenom;

    @JsonProperty("patientId")
    private Long patientId;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
}
