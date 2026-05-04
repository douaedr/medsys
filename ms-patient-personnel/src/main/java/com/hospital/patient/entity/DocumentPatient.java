package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents_patient")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_medical_id", nullable = false)
    private DossierMedical dossierMedical;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.hospital.patient.enums.TypeDocument typeDocument;

    @Column(nullable = false)
    private String nomFichierOriginal;

    @Column(nullable = false)
    private String nomFichierStocke;

    @Column(nullable = false)
    private String cheminFichier;

    private String description;

    private Long tailleFichier;

    private String contentType;

    @Builder.Default
    private LocalDateTime dateUpload = LocalDateTime.now();
}