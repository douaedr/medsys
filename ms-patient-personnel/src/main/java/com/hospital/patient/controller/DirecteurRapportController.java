package com.hospital.patient.controller;

import com.hospital.patient.service.RapportPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * FEAT 4 — Endpoints du directeur pour la génération de rapports PDF.
 *
 * URL prefix : /api/v1/directeur/rapports/**  →  hasAnyRole(DIRECTEUR, ADMIN)
 */
@RestController
@RequestMapping("/api/v1/directeur/rapports")
@RequiredArgsConstructor
public class DirecteurRapportController {

    private final RapportPdfService pdfService;

    @GetMapping("/mensuel")
    public ResponseEntity<byte[]> mensuel(@RequestParam(required = false) Integer mois,
                                          @RequestParam(required = false) Integer annee) {
        int m = mois != null ? mois : LocalDate.now().getMonthValue();
        int a = annee != null ? annee : LocalDate.now().getYear();
        byte[] pdf = pdfService.genererRapportMensuel(m, a);
        return pdfResponse(pdf, "rapport-mensuel-" + a + "-" + String.format("%02d", m) + ".pdf");
    }

    @GetMapping("/annuel")
    public ResponseEntity<byte[]> annuel(@RequestParam(required = false) Integer annee) {
        int a = annee != null ? annee : LocalDate.now().getYear();
        byte[] pdf = pdfService.genererRapportAnnuel(a);
        return pdfResponse(pdf, "rapport-annuel-" + a + ".pdf");
    }

    @GetMapping("/medecins")
    public ResponseEntity<byte[]> medecins() {
        byte[] pdf = pdfService.genererStatsMedecins();
        return pdfResponse(pdf, "stats-medecins.pdf");
    }

    @GetMapping("/patients")
    public ResponseEntity<byte[]> patients() {
        byte[] pdf = pdfService.genererRapportPatients();
        return pdfResponse(pdf, "liste-patients.pdf");
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdf, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdf.length);
        return new ResponseEntity<>(pdf, headers, 200);
    }
}
