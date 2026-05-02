package com.hospital.chatbot.service;

import com.hospital.chatbot.dto.ChatRequest;
import com.hospital.chatbot.dto.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    private static final Set<String> SALUTATIONS = Set.of(
            "bonjour", "salut", "hello", "hi", "coucou", "hey", "bonsoir"
    );

    private final ContextBuilderService contextBuilder;
    private final GeminiService geminiService;

    public ChatbotService(ContextBuilderService contextBuilder,
                          GeminiService geminiService) {
        this.contextBuilder = contextBuilder;
        this.geminiService = geminiService;
    }

    public ChatResponse askQuestion(ChatRequest request) {
        String question = request.getQuestion() != null ? request.getQuestion().trim() : "";
        Long patientId = request.getPatientId();

        log.info("Question recue du patient {} : '{}'", patientId, question);

        String questionLower = question.toLowerCase().replaceAll("[!?.,;:]", "").trim();
        if (SALUTATIONS.contains(questionLower)) {
            return new ChatResponse(
                "Bonjour ! Je suis votre assistant medical MedSys. Vous pouvez me poser des questions sur :\n" +
                "- Votre dossier medical et antecedents\n" +
                "- Vos consultations passees\n" +
                "- Vos rendez-vous\n" +
                "- Vos medicaments et ordonnances\n" +
                "- Vos analyses et radiologies\n" +
                "- Des questions medicales generales (hygiene de vie, prevention, deroulement d'examens)\n\n" +
                "Que voulez-vous savoir aujourd'hui ?",
                LocalDateTime.now(), patientId
            );
        }

        String context = contextBuilder.buildContextForPatient(patientId);
        String prompt = buildPrompt(context, question);
        String reponse = geminiService.generateResponse(prompt);
        return new ChatResponse(reponse, LocalDateTime.now(), patientId);
    }

    private String buildPrompt(String contextePatient, String question) {
        return """
                Tu es MedSys Assistant, un assistant medical intelligent de l'hopital MedSys.
                Tu reponds toujours en francais, de maniere claire, polie et bienveillante.
                
                REGLES :
                1. Tu as acces au dossier medical du patient ci-dessous. Utilise ces donnees en PRIORITE pour repondre.
                   Si le patient demande une info qui EST dans le contexte (groupe sanguin, antecedents, RDV, medicaments),
                   CITE-la directement.
                2. Si la question porte sur une information GENERALE medicale (deroulement d'un examen,
                   hygiene de vie, prevention, symptomes courants, conseils sante, comment se passe
                   un rendez-vous chez un specialiste, etc.), tu peux repondre avec tes connaissances
                   generales. Ne dis PAS "cette info n'est pas dans votre dossier" pour les questions generales.
                3. Tu ne poses JAMAIS de diagnostic. Si le patient decrit des symptomes inquietants,
                   recommande-lui de consulter son medecin traitant.
                4. Tu ne prescris JAMAIS de medicaments ni de dosages.
                5. Tu peux aider le patient a comprendre ses resultats d'analyses, ses ordonnances,
                   et son historique medical.
                6. Si le patient demande comment prendre un rendez-vous, explique-lui d'utiliser
                   l'onglet "Rendez-vous" dans l'application MedSys.
                7. Reste concis : 3-5 phrases max sauf si la question demande des details.
                8. Adopte un ton professionnel et rassurant.
                
                ===== CONTEXTE DU PATIENT (donnees reelles du systeme hospitalier) =====
                %s
                ===== FIN DU CONTEXTE =====
                
                QUESTION DU PATIENT : %s
                
                REPONSE :
                """.formatted(contextePatient, question);
    }
}