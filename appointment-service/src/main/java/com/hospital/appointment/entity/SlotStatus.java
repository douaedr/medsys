package com.hospital.appointment.entity;

/**
 * Statut d'un créneau horaire.
 * Migré depuis Models/TimeSlot.cs (.NET).
 */
public enum SlotStatus {
    Available,
    Reserved,
    Cancelled,
    Blocked
}
