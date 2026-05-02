package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(unique = true)
    private String code;

    private String description;
    private String localisation;
    private Integer capaciteLits;

    /**
     * FEAT 1 — ID du médecin (medecins_ref.id) qui est chef de ce service.
     * Nullable : un service peut ne pas avoir de chef.
     */
    @Column(name = "chef_id")
    private Long chefId;
}
