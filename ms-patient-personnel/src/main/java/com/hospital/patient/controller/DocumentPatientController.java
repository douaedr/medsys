package com.hospital.patient.controller;

import com.hospital.patient.dto.DocumentPatientDTO;
import com.hospital.patient.entity.DocumentPatient;
import com.hospital.patient.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DocumentPatientController {

    private final DocumentService documentService;

    @PostMapping("/upload/{patientId}")
    public ResponseEntity<DocumentPatientDTO> uploadDocument(
            @PathVariable Long patientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "AUTRE") String type,
            @RequestParam(value = "description", required = false) String description) throws IOException {
        DocumentPatientDTO dto = documentService.uploadDocument(patientId, file, type, description);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DocumentPatientDTO>> getDocuments(@PathVariable Long patientId) {
        return ResponseEntity.ok(documentService.getDocuments(patientId));
    }

    @GetMapping("/download/{documentId}/{patientId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long documentId,
            @PathVariable Long patientId) throws IOException {
        DocumentPatient doc = documentService.getDocumentForPatient(documentId, patientId);
        Resource resource = documentService.loadFileAsResource(doc.getCheminFichier());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getNomFichierOriginal() + "\"")
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .body(resource);
    }

    @DeleteMapping("/{documentId}/{patientId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long documentId,
            @PathVariable Long patientId) throws IOException {
        documentService.deleteDocument(documentId, patientId);
        return ResponseEntity.noContent().build();
    }
}