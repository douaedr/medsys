package com.hospital.auth.enums;

/**
 * Rôles utilisateurs dans MedSys.
 *
 * AJOUT FEAT 1 : CHEF_SERVICE — chef de service (médecin promu).
 */
public enum Role {
    // Core roles (new standard names)
    PATIENT,
    DOCTOR,
    SECRETARY,
    ADMIN,
    // Legacy roles kept for backward compatibility
    MEDECIN,
    PERSONNEL,
    DIRECTEUR,
    // FEAT 1 — Chef de service
    CHEF_SERVICE
}
