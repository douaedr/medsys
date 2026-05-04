# ============================================================
# SESSION 1 - MEDSYS
# Fix encodage + DocumentPatientController + DocumentsPatient.jsx
# Executer depuis : C:\Users\douae\Desktop\PFA\medsys-fixed
# ============================================================

$base = "C:\Users\douae\Desktop\PFA\medsys-fixed"
$backendDoc = "$base\ms-patient-personnel\src\main\java\com\hospital\patient"
$frontendComp = "$base\medsys-web\src\components"

# ------------------------------------------------------------
# 1. CREATION DOSSIER DOCUMENTS SI ABSENT
# ------------------------------------------------------------
New-Item -ItemType Directory -Force -Path "$backendDoc" | Out-Null
New-Item -ItemType Directory -Force -Path "$frontendComp" | Out-Null

Write-Host "✅ Dossiers verifies" -ForegroundColor Green

# ------------------------------------------------------------
# 2. DocumentPatientController.java (UTF-8 sans BOM)
# ------------------------------------------------------------
$controllerContent = @'
package com.hospital.patient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentPatientController {

    private static final String UPLOAD_DIR = "uploads/documents/";

    @Autowired
    private DocumentPatientRepository documentRepository;

    // Upload un document pour un patient
    @PostMapping("/upload/{patientId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long patientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam(value = "description", required = false) String description) {

        try {
            // Creer le dossier si absent
            Path uploadPath = Paths.get(UPLOAD_DIR + patientId);
            Files.createDirectories(uploadPath);

            // Nom unique pour eviter les conflits
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String newFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Sauvegarder en base
            DocumentPatient doc = new DocumentPatient();
            doc.setPatientId(patientId);
            doc.setNomFichier(originalFilename);
            doc.setCheminFichier(filePath.toString());
            doc.setType(type);
            doc.setDescription(description);
            doc.setDateUpload(LocalDateTime.now());
            doc.setTaille(file.getSize());

            documentRepository.save(doc);

            return ResponseEntity.ok().body(doc);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur upload : " + e.getMessage());
        }
    }

    // Lister les documents d'un patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DocumentPatient>> getDocumentsByPatient(@PathVariable Long patientId) {
        List<DocumentPatient> docs = documentRepository.findByPatientIdOrderByDateUploadDesc(patientId);
        return ResponseEntity.ok(docs);
    }

    // Telecharger un document
    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        try {
            DocumentPatient doc = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document non trouve"));

            Path filePath = Paths.get(doc.getCheminFichier());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + doc.getNomFichier() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Supprimer un document
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            DocumentPatient doc = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document non trouve"));

            // Supprimer le fichier physique
            Path filePath = Paths.get(doc.getCheminFichier());
            Files.deleteIfExists(filePath);

            // Supprimer de la base
            documentRepository.delete(doc);

            return ResponseEntity.ok().body("Document supprime avec succes");

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur suppression : " + e.getMessage());
        }
    }
}
'@

# Ecrire sans BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$backendDoc\DocumentPatientController.java", $controllerContent, $utf8NoBom)
Write-Host "✅ DocumentPatientController.java cree (UTF-8 sans BOM)" -ForegroundColor Green

# ------------------------------------------------------------
# 3. DocumentPatient.java (Entite JPA)
# ------------------------------------------------------------
$entityContent = @'
package com.hospital.patient;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_patient")
public class DocumentPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "chemin_fichier")
    private String cheminFichier;

    @Column(name = "type")
    private String type;

    @Column(name = "description")
    private String description;

    @Column(name = "date_upload")
    private LocalDateTime dateUpload;

    @Column(name = "taille")
    private Long taille;

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getNomFichier() { return nomFichier; }
    public void setNomFichier(String nomFichier) { this.nomFichier = nomFichier; }

    public String getCheminFichier() { return cheminFichier; }
    public void setCheminFichier(String cheminFichier) { this.cheminFichier = cheminFichier; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateUpload() { return dateUpload; }
    public void setDateUpload(LocalDateTime dateUpload) { this.dateUpload = dateUpload; }

    public Long getTaille() { return taille; }
    public void setTaille(Long taille) { this.taille = taille; }
}
'@

[System.IO.File]::WriteAllText("$backendDoc\DocumentPatient.java", $entityContent, $utf8NoBom)
Write-Host "✅ DocumentPatient.java (entite) cree" -ForegroundColor Green

# ------------------------------------------------------------
# 4. DocumentPatientRepository.java
# ------------------------------------------------------------
$repoContent = @'
package com.hospital.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentPatientRepository extends JpaRepository<DocumentPatient, Long> {
    List<DocumentPatient> findByPatientIdOrderByDateUploadDesc(Long patientId);
}
'@

[System.IO.File]::WriteAllText("$backendDoc\DocumentPatientRepository.java", $repoContent, $utf8NoBom)
Write-Host "✅ DocumentPatientRepository.java cree" -ForegroundColor Green

# ------------------------------------------------------------
# 5. Migration SQL pour la table document_patient
# ------------------------------------------------------------
$sqlDir = "$base\ms-patient-personnel\src\main\resources\db\migration"
New-Item -ItemType Directory -Force -Path $sqlDir | Out-Null

$sqlContent = @'
CREATE TABLE IF NOT EXISTS document_patient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    nom_fichier VARCHAR(255),
    chemin_fichier VARCHAR(500),
    type VARCHAR(100),
    description TEXT,
    date_upload DATETIME,
    taille BIGINT,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);
'@

[System.IO.File]::WriteAllText("$sqlDir\V3__create_document_patient.sql", $sqlContent, $utf8NoBom)
Write-Host "✅ Migration SQL V3 creee" -ForegroundColor Green

# ------------------------------------------------------------
# 6. DocumentsPatient.jsx (composant React)
# ------------------------------------------------------------
$jsxContent = @'
import { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:8081/api/documents";

const TYPES_DOCUMENT = [
  "Ordonnance",
  "Compte-rendu",
  "Analyse",
  "Radio / Imagerie",
  "Certificat",
  "Autre",
];

export default function DocumentsPatient({ patientId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({ type: "Ordonnance", description: "" });
  const fileRef = useRef();

  useEffect(() => {
    if (patientId) fetchDocuments();
  }, [patientId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/patient/${patientId}`);
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      setError("Impossible de charger les documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return setError("Veuillez selectionner un fichier");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", form.type);
    formData.append("description", form.description);

    try {
      setUploading(true);
      setError(null);
      const res = await fetch(`${API_URL}/upload/${patientId}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Echec upload");
      setSuccess("Document uploade avec succes !");
      fileRef.current.value = "";
      setForm({ type: "Ordonnance", description: "" });
      fetchDocuments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      const res = await fetch(`${API_URL}/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchDocuments();
    } catch {
      setError("Erreur suppression");
    }
  };

  const handleDownload = (docId, nomFichier) => {
    window.open(`${API_URL}/download/${docId}`, "_blank");
  };

  const formatTaille = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const iconForType = (type) => {
    const icons = {
      "Ordonnance": "💊",
      "Compte-rendu": "📋",
      "Analyse": "🧪",
      "Radio / Imagerie": "🩻",
      "Certificat": "📄",
      "Autre": "📎",
    };
    return icons[type] || "📎";
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 700, margin: "0 auto", padding: "1rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
        Documents du patient
      </h2>

      {/* Zone upload */}
      <div style={{
        background: "#f8fafc", border: "1.5px dashed #cbd5e1",
        borderRadius: 12, padding: 20, marginBottom: 20
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>
            Fichier
          </label>
          <input
            type="file"
            ref={fileRef}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style={{ fontSize: 13 }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "6px 10px",
                  border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13
                }}
              >
                {TYPES_DOCUMENT.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 2, minWidth: 200 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Résultat prise de sang du 01/05"
                style={{
                  width: "100%", marginTop: 4, padding: "6px 10px",
                  border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13,
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              alignSelf: "flex-start", background: uploading ? "#94a3b8" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 20px", fontSize: 13, fontWeight: 500,
              cursor: uploading ? "not-allowed" : "pointer"
            }}
          >
            {uploading ? "Upload en cours..." : "⬆ Uploader le document"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#fee2e2", borderRadius: 8, fontSize: 13, color: "#b91c1c" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#dcfce7", borderRadius: 8, fontSize: 13, color: "#15803d" }}>
            {success}
          </div>
        )}
      </div>

      {/* Liste documents */}
      {loading ? (
        <p style={{ color: "#64748b", fontSize: 14 }}>Chargement...</p>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>
          Aucun document pour ce patient
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "12px 16px"
            }}>
              <span style={{ fontSize: 24 }}>{iconForType(doc.type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {doc.nomFichier}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {doc.type} · {formatDate(doc.dateUpload)} · {formatTaille(doc.taille)}
                </div>
                {doc.description && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{doc.description}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => handleDownload(doc.id, doc.nomFichier)}
                  style={{
                    background: "#eff6ff", color: "#2563eb", border: "none",
                    borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer"
                  }}
                >
                  ⬇ Télécharger
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  style={{
                    background: "#fff1f2", color: "#be123c", border: "none",
                    borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer"
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'@

[System.IO.File]::WriteAllText("$frontendComp\DocumentsPatient.jsx", $jsxContent, $utf8NoBom)
Write-Host "✅ DocumentsPatient.jsx cree" -ForegroundColor Green

# ------------------------------------------------------------
# 7. Verification finale
# ------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SESSION 1 TERMINEE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers crees :" -ForegroundColor White
Write-Host "  ✅ $backendDoc\DocumentPatientController.java" -ForegroundColor Green
Write-Host "  ✅ $backendDoc\DocumentPatient.java" -ForegroundColor Green
Write-Host "  ✅ $backendDoc\DocumentPatientRepository.java" -ForegroundColor Green
Write-Host "  ✅ $sqlDir\V3__create_document_patient.sql" -ForegroundColor Green
Write-Host "  ✅ $frontendComp\DocumentsPatient.jsx" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaine etape — integrer dans la page patient :" -ForegroundColor Yellow
Write-Host "  import DocumentsPatient from './DocumentsPatient';" -ForegroundColor Gray
Write-Host "  <DocumentsPatient patientId={patient.id} />" -ForegroundColor Gray
Write-Host ""
Write-Host "Puis redemarrer le backend :" -ForegroundColor Yellow
Write-Host "  cd $base\ms-patient-personnel" -ForegroundColor Gray
Write-Host "  .\mvnw spring-boot:run" -ForegroundColor Gray
