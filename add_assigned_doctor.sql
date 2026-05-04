-- Colle dans phpMyAdmin > ms_patient_db (ou ta DB appointment)
ALTER TABLE Users ADD COLUMN assignedDoctorId INT NULL;

-- Assigner les secrétaires existantes à leur médecin (adapte les IDs)
-- UPDATE Users SET assignedDoctorId = ID_MEDECIN WHERE role = 'Secretary';
