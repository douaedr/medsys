package com.hospital.patient.controller;

import com.google.zxing.WriterException;
import com.hospital.patient.dto.*;
import com.hospital.patient.entity.DocumentPatient;
import com.hospital.patient.entity.Patient;
import com.hospital.patient.exception.PatientNotFoundException;
import com.hospital.patient.mapper.PatientMapper;
import com.hospital.patient.repository.PatientRepository;
import com.hospital.patient.security.JwtService;
import com.hospital.patient.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientPortalController {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final JwtService jwtService;
    private final PatientService patientService;
    private final DocumentService documentService;
    private final MessageService messageService;
    private final QrCodeService qrCodeService;
    private final PdfService pdfService;
    private final RdvProxyService rdvProxyService;

    // ─── Profil ───────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<PatientResponseDTO> getMyProfile(
            @RequestHeader("Authorization") String authHeader) {
        Long patientId = extractPatientId(authHeader);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient non trouvé"));
        return ResponseEntity.ok(patientMapper.toResponseDTO(patient));
    }

    @PatchMapping("/me")
    public ResponseEntity<PatientResponseDTO> updateMyProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfilRequest req) {
        Long patientId = extractPatientId(authHeader);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient non trouvé"));

        if (req.getTelephone() != null) patient.setTelephone(req.getTelephone());
        if (req.getEmail()     != null) patient.setEmail(req.getEmail());
        if (req.getAdresse()   != null) patient.setAdresse(req.getAdresse());
        if (req.getVille()     != null) patient.setVille(req.getVille());
        if (req.getMutuelle()  != null) patient.setMutuelle(req.getMutuelle());
        if (req.getNumeroCNSS() != null) patient.setNumeroCNSS(req.getNumeroCNSS());

        return ResponseEntity.ok(patientMapper.toResponseDTO(patientRepository.save(patient)));
    }

    // ─── Dossier ──────────────────────────────────────────────────────────────

    @GetMapping("/me/dossier")
    public ResponseEntity<DossierMedicalDTO> getMyDossier(
            @RequestHeader("Authorization") String authHeader) {
        Long patientId = extractPatientId(authHeader);
        return ResponseEntity.ok(patientService.getDossierMedical(patientId));
    }

    // ─── PDF Export ───────────────────────────────────────────────────────────

    @GetMapping("/me/dossier/pdf")
    public ResponseEntity<byte[]> exportDossierPdf(
            @RequestHeader("Authorization") String authHeader) throws IOException {
        Long patientId = extractPatientId(authHeader);
        byte[] pdf = pdfService.generateDossierPdf(patientId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dossier-medical.pdf\"")
                .body(pdf);
    }

    // ─── QR Code ─────────────────────────────────────────────────────────────

    @GetMapping("/me/qrcode")
    public ResponseEntity<byte[]> getQrCode(
            @RequestHeader("Authorization") String authHeader) throws WriterException, IOException {
        Long patientId = extractPatientId(authHeader);
        byte[] qr = new byte[0] /* TODO: qrCodeService.generatePatientQrCode(patient) */;
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qr);
    }

    // ─── Notifications ────────────────────────────────────────────────────────

    @GetMapping("/me/notifications")
    public ResponseEntity<?> getNotifications(
            @RequestHeader("Authorization") String authHeader) {
        Long patientId = extractPatientId(authHeader);
        return ResponseEntity.ok(java.util.Collections.emptyList() /* TODO: getNotifications */);
    }

    // ─── Documents ────────────────────────────────────────────────────────────

    @PostMapping(value = "/me/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam(value = "type", defaultValue = "AUTRE") String type,
            @RequestParam(value = "description", required = false) String description) throws IOException {
        Long patientId = extractPatientId(authHeader);
        DocumentPatientDTO dto = documentService.uploadDocument(patientId, fichier, type, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/me/documents")
    public ResponseEntity<List<DocumentPatientDTO>> getDocuments(
            @RequestHeader("Authorization") String authHeader) {
        Long patientId = extractPatientId(authHeader);
        return ResponseEntity.ok(documentService.getDocuments(patientId));
    }

    @GetMapping("/me/documents/{id}/fichier")
public ResponseEntity<Resource> getFichier(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id) throws IOException {
    Long patientId = extractPatientId(authHeader);
    DocumentPatient doc = documentService.getDocumentForPatient(id, patientId);
    Resource resource = documentService.loadFileAsResource(doc.getCheminFichier());
    String filename = URLEncoder.encode(doc.getNomFichierOriginal(), StandardCharsets.UTF_8)
                                .replace("+", "%20");
    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(doc.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + filename)
            .body(resource);
}
	@DeleteMapping("/me/documents/{id}")
public ResponseEntity<Void> deleteDocument(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id) throws IOException {
    Long patientId = extractPatientId(authHeader);
    documentService.deleteDocument(id, patientId);
    return ResponseEntity.noContent().build();
}
    // ─── Messagerie ───────────────────────────────────────────────────────────

    @GetMapping("/me/messages")
    public ResponseEntity<?> getMessages(
            @RequestHeader("Authorization") String authHeader) {
        Long patientId = extractPatientId(authHeader);
        return ResponseEntity.ok(messageService.getMessages(patientId));
    }

    @PostMapping("/me/messages")
    public ResponseEntity<?> envoyerMessage(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody EnvoyerMessageRequest req) {
        Long patientId = extractPatientId(authHeader);
        return ResponseEntity.ok(messageService.envoyerMessage(patientId, req));
    }

    @PutMapping("/me/messages/{id}/lu")
    public ResponseEntity<?> marquerLu(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long patientId = extractPatientId(authHeader);
        messageService.marquerLu(id, patientId);
        return ResponseEntity.ok(Map.of("message", "Message marqué comme lu"));
    }

    // ─── Rendez-vous ──────────────────────────────────────────────────────────

    @GetMapping("/me/rdv")
    public ResponseEntity<List<RendezVousDTO>> getMyRdv(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long patientId = jwtService.extractPatientId(token);
        if (patientId == null) throw new PatientNotFoundException("Token invalide");
        String email = jwtService.extractCin(token);
        return ResponseEntity.ok(rdvProxyService.getRdvPatient(patientId, email));
    }

    // 🔧 NOUVEAU : créer un rendez-vous depuis le frontend patient
    @PostMapping("/me/rdv")
    public ResponseEntity<?> creerRdv(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreerRdvRequest req) {
        String token = authHeader.substring(7);
        Long patientId = jwtService.extractPatientId(token);
        if (patientId == null) throw new PatientNotFoundException("Token invalide");
        String email = jwtService.extractCin(token);

        try {
            RendezVousDTO rdv = rdvProxyService.creerRdv(patientId, email, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(rdv);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur création RDV pour patient {}: {}", patientId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Erreur lors de la création du rendez-vous"));
        }
    }

    @PutMapping("/me/rdv/{id}/annuler")
    public ResponseEntity<?> annulerRdv(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        String token = authHeader.substring(7);
        Long patientId = jwtService.extractPatientId(token);
        if (patientId == null) throw new PatientNotFoundException("Token invalide");
        String email = jwtService.extractCin(token);
        boolean ok = rdvProxyService.annulerRdv(id, patientId, email);
        if (ok) return ResponseEntity.ok(Map.of("message", "Rendez-vous annulé avec succès"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Rendez-vous introuvable ou déjà annulé"));
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private Long extractPatientId(String authHeader) {
        String token = authHeader.substring(7);
        Long patientId = jwtService.extractPatientId(token);
        if (patientId == null) throw new PatientNotFoundException("Token invalide");
        return patientId;
    }
}
