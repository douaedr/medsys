package com.hospital.patient.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "fiches_transport")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FicheTransport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String patientNom;

    @Column(nullable = false)
    private String patientPrenom;

    @Column(nullable = false)
    private Long infirmierId;

    private Long brancardlerId;

    @Column(nullable = false)
    private String serviceDepart;

    @Column(nullable = false)
    private String serviceArrivee;

    @Column(nullable = false)
    private String motif;

    @Builder.Default
    private boolean urgence = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Statut statut = Statut.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Statut {
        EN_ATTENTE, EN_COURS, TERMINE, ANNULE
    }
}
