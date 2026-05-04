sql = """-- ============================================================
-- SESSION 2 - MEDSYS - REMPLISSAGE BASE DE DONNEES
-- Port 3307
-- ============================================================

-- ============================================================
-- 1. BASE ms_auth_db (utilisateurs / comptes)
-- ============================================================
USE ms_auth_db;

INSERT IGNORE INTO users (email, password, nom, prenom, role, enabled) VALUES
('admin@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Admin', 'Super', 'ADMIN', 1),
('directeur@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Alami', 'Youssef', 'DIRECTEUR', 1),
('chef.cardio@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Bennani', 'Sara', 'MEDECIN', 1),
('chef.urgences@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Tazi', 'Omar', 'MEDECIN', 1),
('med1@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Idrissi', 'Karim', 'MEDECIN', 1),
('med2@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Mansouri', 'Fatima', 'MEDECIN', 1),
('med3@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Chraibi', 'Ahmed', 'MEDECIN', 1),
('sec1@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Ouali', 'Nadia', 'SECRETARY', 1),
('sec2@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Berrada', 'Hind', 'SECRETARY', 1),
('patient1@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'El Fassi', 'Mohamed', 'PATIENT', 1),
('patient2@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Benhaddou', 'Aicha', 'PATIENT', 1),
('patient3@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Ziani', 'Hamid', 'PATIENT', 1);

-- ============================================================
-- 2. BASE ms_patient_db (patients, personnel, services)
-- ============================================================
USE ms_patient_db;

-- Services
INSERT IGNORE INTO services (id, nom, description, capacite) VALUES
(1, 'Cardiologie', 'Service de cardiologie et maladies cardiovasculaires', 30),
(2, 'Urgences', 'Service des urgences medicales', 50),
(3, 'Pediatrie', 'Service de pediatrie', 25),
(4, 'Radiologie', 'Service de radiologie et imagerie medicale', 20),
(5, 'Chirurgie', 'Service de chirurgie generale', 35);

-- Personnel (medecins + secretaires)
INSERT IGNORE INTO personnel (id, nom, prenom, email, role, specialite, service_id, telephone, actif) VALUES
(1, 'Bennani', 'Sara', 'chef.cardio@medsys.ma', 'MEDECIN', 'Cardiologie', 1, '0661000001', 1),
(2, 'Tazi', 'Omar', 'chef.urgences@medsys.ma', 'MEDECIN', 'Medecine d urgence', 2, '0661000002', 1),
(3, 'Idrissi', 'Karim', 'med1@medsys.ma', 'MEDECIN', 'Cardiologie', 1, '0661000003', 1),
(4, 'Mansouri', 'Fatima', 'med2@medsys.ma', 'MEDECIN', 'Pediatrie', 3, '0661000004', 1),
(5, 'Chraibi', 'Ahmed', 'med3@medsys.ma', 'MEDECIN', 'Chirurgie', 5, '0661000005', 1),
(6, 'Ouali', 'Nadia', 'sec1@medsys.ma', 'SECRETARY', NULL, 1, '0661000006', 1),
(7, 'Berrada', 'Hind', 'sec2@medsys.ma', 'SECRETARY', NULL, 2, '0661000007', 1);

-- 50 Patients
INSERT IGNORE INTO patients (nom, prenom, cin, date_naissance, sexe, telephone, email, adresse, ville, groupe_sanguin, actif) VALUES
('El Fassi', 'Mohamed', 'AB123456', '1985-03-15', 'MASCULIN', '0612000001', 'patient1@medsys.ma', '12 Rue Hassan II', 'Casablanca', 'A_POSITIF', 1),
('Benhaddou', 'Aicha', 'CD234567', '1990-07-22', 'FEMININ', '0612000002', 'patient2@medsys.ma', '45 Av Mohammed V', 'Rabat', 'B_POSITIF', 1),
('Ziani', 'Hamid', 'EF345678', '1978-11-08', 'MASCULIN', '0612000003', 'patient3@medsys.ma', '7 Rue de Fes', 'Fes', 'O_POSITIF', 1),
('Amrani', 'Fatima', 'GH456789', '1965-05-30', 'FEMININ', '0612000004', 'amrani.f@gmail.com', '23 Bd Zerktouni', 'Casablanca', 'AB_POSITIF', 1),
('Tahiri', 'Youssef', 'IJ567890', '1992-09-12', 'MASCULIN', '0612000005', 'tahiri.y@gmail.com', '56 Rue Moulay Ismail', 'Meknes', 'A_NEGATIF', 1),
('Benali', 'Zineb', 'KL678901', '1988-02-28', 'FEMININ', '0612000006', 'benali.z@gmail.com', '89 Av OLA', 'Marrakech', 'B_NEGATIF', 1),
('Lahlou', 'Rachid', 'MN789012', '1975-12-03', 'MASCULIN', '0612000007', 'lahlou.r@gmail.com', '34 Rue Souk', 'Agadir', 'O_NEGATIF', 1),
('Moussaoui', 'Samira', 'OP890123', '1983-06-17', 'FEMININ', '0612000008', 'moussaoui.s@gmail.com', '12 Hay Riad', 'Rabat', 'A_POSITIF', 1),
('Kettani', 'Hassan', 'QR901234', '1970-04-25', 'MASCULIN', '0612000009', 'kettani.h@gmail.com', '67 Rue Ibn Tofail', 'Casablanca', 'B_POSITIF', 1),
('Alaoui', 'Meriem', 'ST012345', '1995-08-14', 'FEMININ', '0612000010', 'alaoui.m@gmail.com', '90 Av Hassan II', 'Sale', 'O_POSITIF', 1),
('Filali', 'Driss', 'UV123456', '1980-01-20', 'MASCULIN', '0612000011', 'filali.d@gmail.com', '11 Rue Atlas', 'Fes', 'A_POSITIF', 1),
('Naciri', 'Houda', 'WX234567', '1987-10-05', 'FEMININ', '0612000012', 'naciri.h@gmail.com', '44 Bd Mohammed VI', 'Tanger', 'AB_NEGATIF', 1),
('Berrada', 'Khalid', 'YZ345678', '1973-03-18', 'MASCULIN', '0612000013', 'berrada.k@gmail.com', '78 Rue Zitoun', 'Marrakech', 'B_POSITIF', 1),
('Sqalli', 'Nadia', 'BA456789', '1991-07-09', 'FEMININ', '0612000014', 'sqalli.n@gmail.com', '22 Hay Mohammadi', 'Casablanca', 'O_POSITIF', 1),
('Tazi', 'Amine', 'DC567890', '1968-11-27', 'MASCULIN', '0612000015', 'tazi.a@gmail.com', '55 Rue Qadi Ayad', 'Rabat', 'A_POSITIF', 1),
('Bensouda', 'Loubna', 'FE678901', '1994-04-13', 'FEMININ', '0612000016', 'bensouda.l@gmail.com', '88 Av Allal Fassi', 'Fes', 'B_NEGATIF', 1),
('Cherkaoui', 'Mehdi', 'HG789012', '1982-08-31', 'MASCULIN', '0612000017', 'cherkaoui.m@gmail.com', '33 Rue Berrima', 'Oujda', 'O_POSITIF', 1),
('Senhaji', 'Khadija', 'JI890123', '1977-12-16', 'FEMININ', '0612000018', 'senhaji.k@gmail.com', '66 Bd Al Massira', 'Agadir', 'A_POSITIF', 1),
('Bennani', 'Tariq', 'LK901234', '1986-05-07', 'MASCULIN', '0612000019', 'bennani.t@gmail.com', '99 Rue Sijilmassa', 'Meknes', 'AB_POSITIF', 1),
('Ghazali', 'Souad', 'NM012345', '1993-09-24', 'FEMININ', '0612000020', 'ghazali.s@gmail.com', '21 Hay Salam', 'Casablanca', 'B_POSITIF', 1),
('Idrissi', 'Badr', 'PO123456', '1971-02-11', 'MASCULIN', '0612000021', 'idrissi.b@gmail.com', '54 Rue Imam Malik', 'Rabat', 'O_NEGATIF', 1),
('Fassi', 'Imane', 'RP234567', '1989-06-28', 'FEMININ', '0612000022', 'fassi.i@gmail.com', '87 Av Mohammed V', 'Sale', 'A_NEGATIF', 1),
('Mansouri', 'Adil', 'TS345678', '1976-10-15', 'MASCULIN', '0612000023', 'mansouri.a@gmail.com', '10 Rue Abdelkrim', 'Nador', 'B_POSITIF', 1),
('Ouazzani', 'Rim', 'VU456789', '1984-03-02', 'FEMININ', '0612000024', 'ouazzani.r@gmail.com', '43 Bd Tarik', 'Tanger', 'O_POSITIF', 1),
('Chraibi', 'Saad', 'XW567890', '1997-07-19', 'MASCULIN', '0612000025', 'chraibi.s@gmail.com', '76 Rue Bab Jdid', 'Fes', 'A_POSITIF', 1),
('Bargach', 'Leila', 'ZY678901', '1966-11-06', 'FEMININ', '0612000026', 'bargach.l@gmail.com', '109 Av Hassan I', 'Casablanca', 'AB_POSITIF', 1),
('Lamrani', 'Kamal', 'AB789012', '1979-04-23', 'MASCULIN', '0612000027', 'lamrani.k@gmail.com', '32 Rue Al Wifaq', 'Rabat', 'B_POSITIF', 1),
('Touzani', 'Wafae', 'CD890123', '1990-08-10', 'FEMININ', '0612000028', 'touzani.w@gmail.com', '65 Hay Al Fath', 'Marrakech', 'O_POSITIF', 1),
('Ennaji', 'Yassine', 'EF901234', '1974-12-27', 'MASCULIN', '0612000029', 'ennaji.y@gmail.com', '98 Rue Moulay Ali', 'Agadir', 'A_POSITIF', 1),
('Bouzidi', 'Hafida', 'GH012345', '1981-05-14', 'FEMININ', '0612000030', 'bouzidi.h@gmail.com', '20 Bd Roudani', 'Casablanca', 'B_NEGATIF', 1),
('Sebti', 'Noureddine', 'IJ123456', '1969-09-01', 'MASCULIN', '0612000031', 'sebti.n@gmail.com', '53 Rue Sebta', 'Tetouan', 'O_POSITIF', 1),
('Hajji', 'Siham', 'KL234567', '1988-02-18', 'FEMININ', '0612000032', 'hajji.s@gmail.com', '86 Av Al Amir', 'Rabat', 'A_POSITIF', 1),
('Zerhouni', 'Hamza', 'MN345678', '1995-06-05', 'MASCULIN', '0612000033', 'zerhouni.h@gmail.com', '19 Rue Ibn Rochd', 'Fes', 'AB_NEGATIF', 1),
('Mekouar', 'Sanaa', 'OP456789', '1972-10-22', 'FEMININ', '0612000034', 'mekouar.s@gmail.com', '52 Bd Al Qods', 'Casablanca', 'B_POSITIF', 1),
('Benkirane', 'Anas', 'QR567890', '1985-03-09', 'MASCULIN', '0612000035', 'benkirane.a@gmail.com', '85 Rue Moussa Ibn', 'Kenitra', 'O_POSITIF', 1),
('Raiss', 'Meryem', 'ST678901', '1992-07-26', 'FEMININ', '0612000036', 'raiss.m@gmail.com', '18 Hay Hassani', 'Casablanca', 'A_NEGATIF', 1),
('Benmoussa', 'Othmane', 'UV789012', '1978-11-13', 'MASCULIN', '0612000037', 'benmoussa.o@gmail.com', '51 Av Yacoub', 'Marrakech', 'B_POSITIF', 1),
('Laraichi', 'Ghita', 'WX890123', '1983-04-30', 'FEMININ', '0612000038', 'laraichi.g@gmail.com', '84 Rue Tafilalet', 'Agadir', 'O_POSITIF', 1),
('Mouline', 'Iliasse', 'YZ901234', '1991-08-17', 'MASCULIN', '0612000039', 'mouline.i@gmail.com', '17 Bd Massira', 'Rabat', 'A_POSITIF', 1),
('Tahiri', 'Najat', 'BA012345', '1967-12-04', 'FEMININ', '0612000040', 'tahiri.n@gmail.com', '50 Rue Lalla Yto', 'Sale', 'AB_POSITIF', 1),
('Filali', 'Rida', 'DC123456', '1980-05-21', 'MASCULIN', '0612000041', 'filali.r@gmail.com', '83 Av Al Massira', 'Fes', 'B_NEGATIF', 1),
('Benali', 'Ibtissam', 'FE234567', '1987-09-08', 'FEMININ', '0612000042', 'benali.i@gmail.com', '16 Hay Riyad', 'Rabat', 'O_POSITIF', 1),
('Alami', 'Soufiane', 'HG345678', '1975-01-25', 'MASCULIN', '0612000043', 'alami.s@gmail.com', '49 Rue Sidi Yahia', 'Oujda', 'A_POSITIF', 1),
('Moatassim', 'Hajar', 'JI456789', '1993-05-12', 'FEMININ', '0612000044', 'moatassim.h@gmail.com', '82 Bd Nations Unies', 'Casablanca', 'B_POSITIF', 1),
('Zeroual', 'Abdelilah', 'LK567890', '1970-09-29', 'MASCULIN', '0612000045', 'zeroual.a@gmail.com', '15 Rue Abdelaziz', 'Tanger', 'O_NEGATIF', 1),
('Khaldi', 'Bouchra', 'NM678901', '1984-02-16', 'FEMININ', '0612000046', 'khaldi.b@gmail.com', '48 Av Bir Anzarane', 'Laayoune', 'A_POSITIF', 1),
('Rhazi', 'Marouane', 'PO789012', '1996-06-03', 'MASCULIN', '0612000047', 'rhazi.m@gmail.com', '81 Rue Sebou', 'Kenitra', 'AB_POSITIF', 1),
('Bennis', 'Amina', 'RP890123', '1973-10-20', 'FEMININ', '0612000048', 'bennis.a@gmail.com', '14 Hay Annahda', 'Casablanca', 'B_POSITIF', 1),
('Jaidi', 'Zakaria', 'TS901234', '1982-03-07', 'MASCULIN', '0612000049', 'jaidi.z@gmail.com', '47 Bd Allal Fassi', 'Rabat', 'O_POSITIF', 1),
('Mernissi', 'Dounia', 'VU012345', '1989-07-24', 'FEMININ', '0612000050', 'mernissi.d@gmail.com', '80 Rue Ibn Sina', 'Fes', 'A_NEGATIF', 1);

-- ============================================================
-- 3. BASE ms_appointment_db (rendez-vous)
-- ============================================================
USE ms_appointment_db;

INSERT IGNORE INTO time_slots (medecin_id, start_time, end_time, available) VALUES
(1, '2026-05-05 09:00:00', '2026-05-05 09:30:00', 0),
(1, '2026-05-05 09:30:00', '2026-05-05 10:00:00', 0),
(1, '2026-05-05 10:00:00', '2026-05-05 10:30:00', 1),
(1, '2026-05-05 10:30:00', '2026-05-05 11:00:00', 1),
(2, '2026-05-05 08:00:00', '2026-05-05 08:30:00', 0),
(2, '2026-05-05 08:30:00', '2026-05-05 09:00:00', 1),
(3, '2026-05-06 09:00:00', '2026-05-06 09:30:00', 0),
(3, '2026-05-06 09:30:00', '2026-05-06 10:00:00', 1),
(4, '2026-05-06 10:00:00', '2026-05-06 10:30:00', 0),
(5, '2026-05-07 11:00:00', '2026-05-07 11:30:00', 0);

INSERT IGNORE INTO appointments (time_slot_id, patient_id, booked_by_id, reason, status) VALUES
(1, 1, 1, 'Consultation cardiologie', 'Confirmed'),
(2, 2, 2, 'Suivi tension arterielle', 'Confirmed'),
(5, 3, 3, 'Urgence douleur thoracique', 'Confirmed'),
(7, 4, 1, 'Bilan cardiaque', 'Confirmed'),
(9, 5, 4, 'Consultation pediatrique', 'Confirmed'),
(10, 6, 5, 'Consultation chirurgie', 'Confirmed');
"""

with open(r"C:\Users\douae\Desktop\PFA\medsys-fixed\session2.sql", "w", encoding="utf-8", newline="\n") as f:
    f.write(sql)
print("DONE - session2.sql genere!")
