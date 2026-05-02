package com.hospital.chatbot.service;

import com.hospital.chatbot.client.AppointmentClient;
import com.hospital.chatbot.client.PatientClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ContextBuilderService {

    private static final Logger log = LoggerFactory.getLogger(ContextBuilderService.class);

    private final PatientClient patientClient;
    private final AppointmentClient appointmentClient;

    public ContextBuilderService(PatientClient patientClient,
                                 AppointmentClient appointmentClient) {
        this.patientClient = patientClient;
        this.appointmentClient = appointmentClient;
    }

    public String buildContextForPatient(Long patientId) {
        log.info("Construction du contexte pour le patient {}", patientId);

        StringBuilder context = new StringBuilder();

        // ----- Informations personnelles -----
        context.append("=== INFORMATIONS DU PATIENT ===\n");
        Map<String, Object> patient = patientClient.getPatientInfo(patientId);
        if (patient != null) {
            appendIfPresent(context, "Nom", patient.get("nom"));
            appendIfPresent(context, "Prenom", patient.get("prenom"));
            appendIfPresent(context, "Date de naissance", patient.get("dateNaissance"));
            appendIfPresent(context, "Age", patient.get("age"));
            appendIfPresent(context, "Sexe", patient.get("sexe"));
            appendIfPresent(context, "Groupe sanguin", patient.get("groupeSanguin"));
            appendIfPresent(context, "Telephone", patient.get("telephone"));
            appendIfPresent(context, "Email", patient.get("email"));
            appendIfPresent(context, "Adresse", patient.get("adresse"));
        } else {
            context.append("(Aucune information patient disponible)\n");
        }

        // ----- Dossier medical complet -----
        Map<String, Object> dossier = patientClient.getDossierMedical(patientId);
        if (dossier != null) {
            context.append("\n=== DOSSIER MEDICAL ===\n");
            appendIfPresent(context, "Numero dossier", dossier.get("numeroDossier"));

            // Antecedents
            List<Map<String, Object>> antecedents = (List<Map<String, Object>>) dossier.get("antecedents");
            if (antecedents != null && !antecedents.isEmpty()) {
                context.append("\n--- ANTECEDENTS ---\n");
                for (Map<String, Object> a : antecedents) {
                    context.append("- [").append(a.get("typeAntecedent")).append("] ");
                    context.append(a.get("description"));
                    if (a.get("dateDiagnostic") != null) {
                        context.append(" (diagnostique le ").append(a.get("dateDiagnostic")).append(")");
                    }
                    if (a.get("severite") != null) {
                        context.append(" - Severite: ").append(a.get("severite"));
                    }
                    context.append("\n");
                }
            }

            // Consultations
            List<Map<String, Object>> consultations = (List<Map<String, Object>>) dossier.get("consultations");
            if (consultations != null && !consultations.isEmpty()) {
                context.append("\n--- CONSULTATIONS ---\n");
                for (Map<String, Object> c : consultations) {
                    context.append("- Date: ").append(c.get("dateConsultation"));
                    appendInline(context, "Motif", c.get("motif"));
                    appendInline(context, "Diagnostic", c.get("diagnostic"));
                    appendInline(context, "Traitement", c.get("traitement"));
                    appendInline(context, "Medecin", c.get("medecinNomComplet"));
                    context.append("\n");
                }
            }

            // Ordonnances
            List<Map<String, Object>> ordonnances = (List<Map<String, Object>>) dossier.get("ordonnances");
            if (ordonnances != null && !ordonnances.isEmpty()) {
                context.append("\n--- ORDONNANCES ---\n");
                for (Map<String, Object> o : ordonnances) {
                    context.append("- Date: ").append(o.get("dateOrdonnance"));
                    appendInline(context, "Type", o.get("typeOrdonnance"));
                    appendInline(context, "Instructions", o.get("instructions"));
                    context.append("\n");

                    List<Map<String, Object>> lignes = (List<Map<String, Object>>) o.get("lignes");
                    if (lignes != null && !lignes.isEmpty()) {
                        for (Map<String, Object> l : lignes) {
                            context.append("    * ").append(l.get("medicament"));
                            if (l.get("dosage") != null) context.append(" ").append(l.get("dosage"));
                            if (l.get("posologie") != null) context.append(" - ").append(l.get("posologie"));
                            if (l.get("dureeJours") != null) context.append(" pendant ").append(l.get("dureeJours")).append(" jours");
                            context.append("\n");
                        }
                    }
                }
            }

            // Analyses
            List<Map<String, Object>> analyses = (List<Map<String, Object>>) dossier.get("analyses");
            if (analyses != null && !analyses.isEmpty()) {
                context.append("\n--- ANALYSES DE LABORATOIRE ---\n");
                for (Map<String, Object> a : analyses) {
                    context.append("- ").append(a.get("typeAnalyse"));
                    appendInline(context, "Date", a.get("dateAnalyse"));
                    appendInline(context, "Statut", a.get("statut"));
                    appendInline(context, "Resultats", a.get("resultats"));
                    appendInline(context, "Valeurs reference", a.get("valeurReference"));
                    context.append("\n");
                }
            }

            // Radiologies
            List<Map<String, Object>> radiologies = (List<Map<String, Object>>) dossier.get("radiologies");
            if (radiologies != null && !radiologies.isEmpty()) {
                context.append("\n--- RADIOLOGIES ---\n");
                for (Map<String, Object> r : radiologies) {
                    context.append("- ").append(r.get("typeExamen"));
                    appendInline(context, "Date", r.get("dateExamen"));
                    appendInline(context, "Conclusion", r.get("conclusion"));
                    context.append("\n");
                }
            }
        }

        // ----- Rendez-vous -----
        String patientEmail = patient != null ? (String) patient.get("email") : null;
        List<Map<String, Object>> rdvs = appointmentClient.getRendezVousByPatientEmail(patientEmail);
        context.append("\n=== RENDEZ-VOUS ===\n");
        if (rdvs.isEmpty()) {
            context.append("Aucun rendez-vous enregistre.\n");
        } else {
            for (Map<String, Object> rdv : rdvs) {
                context.append("- ");
                appendInline(context, "Date et heure debut", rdv.get("startTime"));
                appendInline(context, "Heure fin", rdv.get("endTime"));
                appendInline(context, "Medecin", rdv.get("doctorName"));
                appendInline(context, "Statut", rdv.get("status"));
                appendInline(context, "Motif", rdv.get("reason"));
                context.append("\n");
            }
        }

        String result = context.toString();
        log.debug("Contexte construit ({} caracteres)", result.length());
        return result;
    }

    private void appendIfPresent(StringBuilder sb, String label, Object value) {
        if (value != null && !value.toString().isBlank()) {
            sb.append(label).append(" : ").append(value).append("\n");
        }
    }

    private void appendInline(StringBuilder sb, String label, Object value) {
        if (value != null && !value.toString().isBlank()) {
            sb.append(" | ").append(label).append(": ").append(value);
        }
    }
}