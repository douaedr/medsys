package com.hospital.appointment.entity;

/**
 * Statut d'un rendez-vous.
 * Migré depuis Models/Appointment.cs (.NET).
 */
public enum AppointmentStatus {
    Pending,
    Confirmed,
    CancelledByPatient,
    CancelledByDoctor,
    CancelledBySecretary,
    Completed,
    NoShow
}
