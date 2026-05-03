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
import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentPatientController {

    private final DocumentService documentService;

    // POST /api/v1/patients/{id}/documents
    @PostMapping("/{id}/documents")
    public ResponseEntity<DocumentPatientDTO> upload(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "AUTRE") String type,
            @RequestParam(value = "description", required = false) String description
    ) throws IOException {
        return ResponseEntity.ok(documentService.uploadDocument(id, file, type, description));
    }

    // GET /api/v1/patients/{id}/documents
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentPatientDTO>> getDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocuments(id));
    }

    // GET /api/v1/patients/{id}/documents/{docId}/download
    @GetMapping("/{id}/documents/{docId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @PathVariable Long docId
    ) throws MalformedURLException {
        DocumentPatient doc = documentService.getDocumentForPatient(docId, id);
        Resource resource = documentService.loadFileAsResource(doc.getCheminFichier());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + doc.getNomFichierOriginal() + "\"")
                .contentType(MediaType.parseMediaType(
                        doc.getContentType() != null ? doc.getContentType() : "application/octet-stream"))
                .body(resource);
    }

    // DELETE /api/v1/patients/{id}/documents/{docId}
    @DeleteMapping("/{id}/documents/{docId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @PathVariable Long docId
    ) throws IOException {
        documentService.deleteDocument(docId, id);
        return ResponseEntity.noContent().build();
    }
}
