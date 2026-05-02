package com.hospital.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Requete envoyee par le patient au chatbot
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    @NotNull(message = "L'ID du patient est obligatoire")
    private Long patientId;

    @NotBlank(message = "La question ne peut pas etre vide")
    private String question;
}
