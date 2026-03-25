package com.hospital.patient.service;

import com.hospital.patient.dto.DocumentPatientDTO;
import com.hospital.patient.entity.DocumentPatient;
import com.hospital.patient.entity.DossierMedical;
import com.hospital.patient.entity.Patient;
import com.hospital.patient.enums.TypeDocument;
import com.hospital.patient.exception.PatientNotFoundException;
import com.hospital.patient.repository.DocumentPatientRepository;
import com.hospital.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    @Value("${app.upload.dir:uploads/patients}")
    private String uploadDir;

    private final DocumentPatientRepository documentRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public DocumentPatientDTO uploadDocument(Long patientId, MultipartFile file,
                                              String typeDoc, String description) throws IOException {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient non trouvé"));

        DossierMedical dossier = patient.getDossierMedical();
        if (dossier == null) {
            throw new PatientNotFoundException("Dossier médical non trouvé");
        }

        // Validation taille fichier (5 MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Fichier trop volumineux. Taille maximale : 5 MB.");
        }

        // Validation type de fichier (PDF, images uniquement)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new IllegalArgumentException("Type de fichier non autorisé. Seuls les PDF et images sont acceptés.");
        }

        // Créer le répertoire patient si nécessaire
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path patientDir = uploadRoot.resolve(String.valueOf(patientId)).normalize();
        // Vérification path traversal
        if (!patientDir.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Chemin de destination non autorisé.");
        }
        Files.createDirectories(patientDir);

        // Générer un nom de fichier unique (UUID uniquement, sans nom original)
        String extension = getExtension(file.getOriginalFilename());
        String nomFichierStocke = UUID.randomUUID().toString() + extension;
        Path cheminComplet = patientDir.resolve(nomFichierStocke).normalize();
        // Double vérification path traversal sur le fichier final
        if (!cheminComplet.startsWith(patientDir)) {
            throw new IllegalArgumentException("Chemin de fichier non autorisé.");
        }

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), cheminComplet, StandardCopyOption.REPLACE_EXISTING);

        TypeDocument typeDocument;
        try {
            typeDocument = TypeDocument.valueOf(typeDoc.toUpperCase());
        } catch (IllegalArgumentException e) {
            typeDocument = TypeDocument.AUTRE;
        }

        DocumentPatient document = DocumentPatient.builder()
                .dossierMedical(dossier)
                .typeDocument(typeDocument)
                .nomFichierOriginal(file.getOriginalFilename())
                .nomFichierStocke(nomFichierStocke)
                .cheminFichier(cheminComplet.toString())
                .description(description)
                .tailleFichier(file.getSize())
                .contentType(contentType)
                .build();

        document = documentRepository.save(document);
        log.info("Document uploadé: {} pour patient {}", nomFichierStocke, patientId);

        return toDTO(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentPatientDTO> getDocuments(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient non trouvé"));

        if (patient.getDossierMedical() == null) {
            return List.of();
        }

        return documentRepository
                .findByDossierMedicalIdOrderByDateUploadDesc(patient.getDossierMedical().getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentPatient getDocumentForPatient(Long documentId, Long patientId) {
        return documentRepository.findByIdAndDossierMedicalPatientId(documentId, patientId)
                .orElseThrow(() -> new PatientNotFoundException("Document non trouvé"));
    }

    public Resource loadFileAsResource(String cheminFichier) throws MalformedURLException {
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = Paths.get(cheminFichier).normalize();
        if (!filePath.startsWith(uploadRoot)) {
            throw new PatientNotFoundException("Accès au fichier non autorisé");
        }
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new PatientNotFoundException("Fichier non trouvé");
        }
        return resource;
    }

    @Transactional
    public void deleteDocument(Long documentId, Long patientId) throws IOException {
        DocumentPatient document = documentRepository.findByIdAndDossierMedicalPatientId(documentId, patientId)
                .orElseThrow(() -> new PatientNotFoundException("Document non trouvé"));

        // Supprimer le fichier physique
        Path filePath = Paths.get(document.getCheminFichier());
        Files.deleteIfExists(filePath);

        documentRepository.delete(document);
        log.info("Document supprimé: {} pour patient {}", documentId, patientId);
    }

    private DocumentPatientDTO toDTO(DocumentPatient doc) {
        return DocumentPatientDTO.builder()
                .id(doc.getId())
                .typeDocument(doc.getTypeDocument().name())
                .nomFichierOriginal(doc.getNomFichierOriginal())
                .description(doc.getDescription())
                .tailleFichier(doc.getTailleFichier())
                .contentType(doc.getContentType())
                .dateUpload(doc.getDateUpload())
                .build();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        // N'autoriser que les extensions connues sûres
        if (ext.matches("\\.(pdf|jpg|jpeg|png|gif|bmp|webp)")) {
            return ext;
        }
        return "";
    }
}
