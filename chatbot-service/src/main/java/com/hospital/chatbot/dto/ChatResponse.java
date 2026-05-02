package com.hospital.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Reponse du chatbot envoyee au patient
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private String reponse;
    private LocalDateTime timestamp;
    private Long patientId;
}
