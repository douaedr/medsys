package com.hospital.patient.service;

import com.hospital.patient.entity.Medecin;
import com.hospital.patient.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

/**
 * FEAT 4 — Génération des rapports PDF pour le directeur.
 *
 * Utilise OpenPDF (com.github.librepdf). Si vous utilisez plutôt iText 5/7,
 * adaptez les imports — l'API est très proche.
 *
 * Si OpenPDF n'est pas dans pom.xml, ajouter :
 *   <dependency>
 *     <groupId>com.github.librepdf</groupId>
 *     <artifactId>openpdf</artifactId>
 *     <version>1.3.30</version>
 *   </dependency>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RapportPdfService {

    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final ConsultationRepository consultationRepository;
    private final AppointmentRecordRepository rendezVousRepository;
    private final ServiceRepository serviceRepository;

    private static final Font TITLE = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(15, 76, 117));
    private static final Font H2    = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(20, 90, 130));
    private static final Font H3    = new Font(Font.HELVETICA, 11, Font.BOLD, Color.DARK_GRAY);
    private static final Font BODY  = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    private static final Font SMALL = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);

    public byte[] genererRapportMensuel(int mois, int annee) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 50, 40);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            String moisNom = Month.of(mois).getDisplayName(TextStyle.FULL, Locale.FRENCH);
            addHeader(doc, "Rapport mensuel — " + capitalize(moisNom) + " " + annee);

            doc.add(paragraph("Généré le " + DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm").format(LocalDateTime.now()), SMALL));
            doc.add(Chunk.NEWLINE);

            // Stats globales
            long totalPatients = patientRepository.count();
            long totalConsultations = consultationRepository.count();
            long totalRdv = rendezVousRepository.count();

            doc.add(paragraph("Statistiques globales", H2));
            PdfPTable t = new PdfPTable(2);
            t.setWidthPercentage(60);
            t.setSpacingBefore(6);
            t.setHorizontalAlignment(Element.ALIGN_LEFT);
            addRow(t, "Patients enregistrés (total)", String.valueOf(totalPatients));
            addRow(t, "Consultations (total)", String.valueOf(totalConsultations));
            addRow(t, "Rendez-vous (total)", String.valueOf(totalRdv));
            addRow(t, "Médecins actifs", String.valueOf(medecinRepository.count()));
            addRow(t, "Services hospitaliers", String.valueOf(serviceRepository.count()));
            doc.add(t);

            doc.add(Chunk.NEWLINE);
            doc.add(paragraph(
                    "Note : ce rapport présente les chiffres globaux du système au moment de la génération. " +
                            "Pour des chiffres mensuels exacts, ajouter un filtre par mois sur les requêtes Repository.",
                    SMALL));

            addFooter(doc);
            doc.close();
        } catch (Exception e) {
            log.error("Erreur génération rapport mensuel", e);
            throw new RuntimeException("Impossible de générer le PDF : " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    public byte[] genererRapportAnnuel(int annee) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 50, 40);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            addHeader(doc, "Rapport annuel — " + annee);
            doc.add(paragraph("Généré le " + DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm").format(LocalDateTime.now()), SMALL));
            doc.add(Chunk.NEWLINE);

            doc.add(paragraph("Indicateurs clés " + annee, H2));
            PdfPTable t = new PdfPTable(2);
            t.setWidthPercentage(70);
            addRow(t, "Patients (cumul)", String.valueOf(patientRepository.count()));
            addRow(t, "Consultations (cumul)", String.valueOf(consultationRepository.count()));
            addRow(t, "Rendez-vous (cumul)", String.valueOf(rendezVousRepository.count()));
            addRow(t, "Médecins inscrits", String.valueOf(medecinRepository.count()));
            addRow(t, "Services hospitaliers", String.valueOf(serviceRepository.count()));
            doc.add(t);

            // Répartition par service
            doc.add(Chunk.NEWLINE);
            doc.add(paragraph("Répartition par service", H2));
            PdfPTable byService = new PdfPTable(new float[]{3, 1, 1});
            byService.setWidthPercentage(100);
            addHeaderCell(byService, "Service");
            addHeaderCell(byService, "Médecins");
            addHeaderCell(byService, "Capacité lits");
            serviceRepository.findAll().forEach(svc -> {
                addBodyCell(byService, svc.getNom() != null ? svc.getNom() : "—");
                addBodyCell(byService, String.valueOf(medecinRepository.findByService_Id(svc.getId()).size()));
                addBodyCell(byService, svc.getCapaciteLits() != null ? svc.getCapaciteLits().toString() : "—");
            });
            doc.add(byService);

            addFooter(doc);
            doc.close();
        } catch (Exception e) {
            log.error("Erreur génération rapport annuel", e);
            throw new RuntimeException("Impossible de générer le PDF : " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    public byte[] genererStatsMedecins() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 50, 40);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            addHeader(doc, "Activité des médecins");
            doc.add(paragraph("Généré le " + DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm").format(LocalDateTime.now()), SMALL));
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(new float[]{2, 2, 2, 2});
            table.setWidthPercentage(100);
            addHeaderCell(table, "Médecin");
            addHeaderCell(table, "Matricule");
            addHeaderCell(table, "Spécialité");
            addHeaderCell(table, "Service");

            List<Medecin> medecins = medecinRepository.findAll();
            for (Medecin m : medecins) {
                addBodyCell(table, "Dr. " + safe(m.getPrenom()) + " " + safe(m.getNom()));
                addBodyCell(table, safe(m.getMatricule()));
                addBodyCell(table, m.getSpecialite() != null ? safeNomReflect(m.getSpecialite()) : "—");
                addBodyCell(table, m.getService() != null ? m.getService().getNom() : "—");
            }
            doc.add(table);

            doc.add(Chunk.NEWLINE);
            doc.add(paragraph("Total : " + medecins.size() + " médecin(s) enregistré(s).", BODY));

            addFooter(doc);
            doc.close();
        } catch (Exception e) {
            log.error("Erreur génération stats médecins", e);
            throw new RuntimeException("Impossible de générer le PDF : " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    public byte[] genererRapportPatients() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 50, 40);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            addHeader(doc, "Liste des patients");
            doc.add(paragraph("Généré le " + DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm").format(LocalDateTime.now()), SMALL));
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(new float[]{2, 1.2f, 1, 1.5f, 2});
            table.setWidthPercentage(100);
            addHeaderCell(table, "Nom complet");
            addHeaderCell(table, "CIN");
            addHeaderCell(table, "Sexe");
            addHeaderCell(table, "Naissance");
            addHeaderCell(table, "Téléphone");

            patientRepository.findAll().forEach(p -> {
                try {
                    addBodyCell(table, safeReflect(p, "getPrenom") + " " + safeReflect(p, "getNom"));
                    addBodyCell(table, safeReflect(p, "getCin"));
                    addBodyCell(table, safeReflect(p, "getSexe"));
                    addBodyCell(table, safeReflect(p, "getDateNaissance"));
                    addBodyCell(table, safeReflect(p, "getTelephone"));
                } catch (Exception ignored) {}
            });
            doc.add(table);

            addFooter(doc);
            doc.close();
        } catch (Exception e) {
            log.error("Erreur génération rapport patients", e);
            throw new RuntimeException("Impossible de générer le PDF : " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    /* ────── Mise en page ────── */

    private void addHeader(Document doc, String title) throws DocumentException {
        Paragraph p = new Paragraph("MedSys — Hôpital", H3);
        p.setAlignment(Element.ALIGN_LEFT);
        doc.add(p);
        Paragraph titre = new Paragraph(title, TITLE);
        titre.setSpacingBefore(2);
        titre.setSpacingAfter(8);
        doc.add(titre);
        LineSeparator sep = new LineSeparator(0.5f, 100, new Color(15, 76, 117), Element.ALIGN_CENTER, -2);
        doc.add(new Chunk(sep));
    }

    private void addFooter(Document doc) throws DocumentException {
        doc.add(Chunk.NEWLINE);
        LineSeparator sep = new LineSeparator(0.3f, 100, Color.LIGHT_GRAY, Element.ALIGN_CENTER, -2);
        doc.add(new Chunk(sep));
        doc.add(paragraph("Document confidentiel — MedSys © " + LocalDate.now().getYear(), SMALL));
    }

    private Paragraph paragraph(String text, Font font) {
        return new Paragraph(text, font);
    }

    private void addRow(PdfPTable t, String label, String value) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, H3));
        c1.setBackgroundColor(new Color(245, 247, 250));
        c1.setPadding(6);
        t.addCell(c1);
        PdfPCell c2 = new PdfPCell(new Phrase(value, BODY));
        c2.setPadding(6);
        t.addCell(c2);
    }

    private void addHeaderCell(PdfPTable t, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
        c.setBackgroundColor(new Color(15, 76, 117));
        c.setPadding(6);
        t.addCell(c);
    }

    private void addBodyCell(PdfPTable t, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text != null ? text : "—", BODY));
        c.setPadding(5);
        t.addCell(c);
    }

    private String safe(String s) { return s != null ? s : ""; }

    private String safeNomReflect(Object o) {
        try {
            java.lang.reflect.Method m = o.getClass().getMethod("getNom");
            Object r = m.invoke(o);
            return r != null ? r.toString() : "—";
        } catch (Exception e) {
            return "—";
        }
    }

    private String safeReflect(Object o, String method) {
        try {
            java.lang.reflect.Method m = o.getClass().getMethod(method);
            Object r = m.invoke(o);
            return r != null ? r.toString() : "—";
        } catch (Exception e) {
            return "—";
        }
    }

    private String capitalize(String s) {
        return (s == null || s.isEmpty()) ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
