USE ms_auth_db;

INSERT IGNORE INTO user_accounts (email, password, nom, prenom, role, enabled) VALUES
('admin@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Admin', 'Super', 'ADMIN', b'1'),
('directeur@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Alami', 'Youssef', 'DIRECTEUR', b'1'),
('chef.cardio@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Bennani', 'Sara', 'MEDECIN', b'1'),
('chef.urgences@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Tazi', 'Omar', 'MEDECIN', b'1'),
('med1@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Idrissi', 'Karim', 'MEDECIN', b'1'),
('med2@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Mansouri', 'Fatima', 'MEDECIN', b'1'),
('med3@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Chraibi', 'Ahmed', 'MEDECIN', b'1'),
('sec1@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Ouali', 'Nadia', 'SECRETARY', b'1'),
('sec2@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Berrada', 'Hind', 'SECRETARY', b'1'),
('patient1@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'El Fassi', 'Mohamed', 'PATIENT', b'1'),
('patient2@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Benhaddou', 'Aicha', 'PATIENT', b'1'),
('patient3@medsys.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LXJqQW8e9DS', 'Ziani', 'Hamid', 'PATIENT', b'1');

USE ms_patient_db;

INSERT IGNORE INTO services (nom, code, description, capacite_lits, localisation) VALUES
('Cardiologie', 'CARDIO', 'Service de cardiologie', 30, 'Batiment A - 2eme etage'),
('Urgences', 'URG', 'Service des urgences 24h/24', 50, 'Rez-de-chaussee'),
('Pediatrie', 'PEDIA', 'Service de pediatrie', 25, 'Batiment B - 1er etage'),
('Radiologie', 'RADIO', 'Service de radiologie', 20, 'Batiment C - RDC'),
('Chirurgie', 'CHIR', 'Service de chirurgie generale', 35, 'Batiment A - 3eme etage');

INSERT IGNORE INTO patients (nom, prenom, cin, date_naissance, sexe, telephone, email, adresse, ville, groupe_sanguin) VALUES
('El Fassi', 'Mohamed', 'AB123456', '1985-03-15', 'MASCULIN', '0612000001', 'patient1@medsys.ma', '12 Rue Hassan II', 'Casablanca', 'A_POSITIF'),
('Benhaddou', 'Aicha', 'CD234567', '1990-07-22', 'FEMININ', '0612000002', 'patient2@medsys.ma', '45 Av Mohammed V', 'Rabat', 'B_POSITIF'),
('Ziani', 'Hamid', 'EF345678', '1978-11-08', 'MASCULIN', '0612000003', 'patient3@medsys.ma', '7 Rue de Fes', 'Fes', 'O_POSITIF'),
('Amrani', 'Fatima', 'GH456789', '1965-05-30', 'FEMININ', '0612000004', 'amrani.f@gmail.com', '23 Bd Zerktouni', 'Casablanca', 'AB_POSITIF'),
('Tahiri', 'Youssef', 'IJ567890', '1992-09-12', 'MASCULIN', '0612000005', 'tahiri.y@gmail.com', '56 Rue Moulay Ismail', 'Meknes', 'A_NEGATIF'),
('Benali', 'Zineb', 'KL678901', '1988-02-28', 'FEMININ', '0612000006', 'benali.z@gmail.com', '89 Av OLA', 'Marrakech', 'B_NEGATIF'),
('Lahlou', 'Rachid', 'MN789012', '1975-12-03', 'MASCULIN', '0612000007', 'lahlou.r@gmail.com', '34 Rue Souk', 'Agadir', 'O_NEGATIF'),
('Moussaoui', 'Samira', 'OP890123', '1983-06-17', 'FEMININ', '0612000008', 'moussaoui.s@gmail.com', '12 Hay Riad', 'Rabat', 'A_POSITIF'),
('Kettani', 'Hassan', 'QR901234', '1970-04-25', 'MASCULIN', '0612000009', 'kettani.h@gmail.com', '67 Rue Ibn Tofail', 'Casablanca', 'B_POSITIF'),
('Alaoui', 'Meriem', 'ST012345', '1995-08-14', 'FEMININ', '0612000010', 'alaoui.m@gmail.com', '90 Av Hassan II', 'Sale', 'O_POSITIF'),
('Filali', 'Driss', 'UV123456', '1980-01-20', 'MASCULIN', '0612000011', 'filali.d@gmail.com', '11 Rue Atlas', 'Fes', 'A_POSITIF'),
('Naciri', 'Houda', 'WX234567', '1987-10-05', 'FEMININ', '0612000012', 'naciri.h@gmail.com', '44 Bd Mohammed VI', 'Tanger', 'AB_NEGATIF'),
('Berrada', 'Khalid', 'YZ345678', '1973-03-18', 'MASCULIN', '0612000013', 'berrada.k@gmail.com', '78 Rue Zitoun', 'Marrakech', 'B_POSITIF'),
('Sqalli', 'Nadia', 'BA456789', '1991-07-09', 'FEMININ', '0612000014', 'sqalli.n@gmail.com', '22 Hay Mohammadi', 'Casablanca', 'O_POSITIF'),
('Tazi', 'Amine', 'DC567890', '1968-11-27', 'MASCULIN', '0612000015', 'tazi.a@gmail.com', '55 Rue Qadi Ayad', 'Rabat', 'A_POSITIF'),
('Bensouda', 'Loubna', 'FE678901', '1994-04-13', 'FEMININ', '0612000016', 'bensouda.l@gmail.com', '88 Av Allal Fassi', 'Fes', 'B_NEGATIF'),
('Cherkaoui', 'Mehdi', 'HG789012', '1982-08-31', 'MASCULIN', '0612000017', 'cherkaoui.m@gmail.com', '33 Rue Berrima', 'Oujda', 'O_POSITIF'),
('Senhaji', 'Khadija', 'JI890123', '1977-12-16', 'FEMININ', '0612000018', 'senhaji.k@gmail.com', '66 Bd Al Massira', 'Agadir', 'A_POSITIF'),
('Bennani', 'Tariq', 'LK901234', '1986-05-07', 'MASCULIN', '0612000019', 'bennani.t@gmail.com', '99 Rue Sijilmassa', 'Meknes', 'AB_POSITIF'),
('Ghazali', 'Souad', 'NM012345', '1993-09-24', 'FEMININ', '0612000020', 'ghazali.s@gmail.com', '21 Hay Salam', 'Casablanca', 'B_POSITIF'),
('Idrissi', 'Badr', 'PO123456', '1971-02-11', 'MASCULIN', '0612000021', 'idrissi.b@gmail.com', '54 Rue Imam Malik', 'Rabat', 'O_NEGATIF'),
('Fassi', 'Imane', 'RP234567', '1989-06-28', 'FEMININ', '0612000022', 'fassi.i@gmail.com', '87 Av Mohammed V', 'Sale', 'A_NEGATIF'),
('Mansouri', 'Adil', 'TS345678', '1976-10-15', 'MASCULIN', '0612000023', 'mansouri.a@gmail.com', '10 Rue Abdelkrim', 'Nador', 'B_POSITIF'),
('Ouazzani', 'Rim', 'VU456789', '1984-03-02', 'FEMININ', '0612000024', 'ouazzani.r@gmail.com', '43 Bd Tarik', 'Tanger', 'O_POSITIF'),
('Chraibi', 'Saad', 'XW567890', '1997-07-19', 'MASCULIN', '0612000025', 'chraibi.s@gmail.com', '76 Rue Bab Jdid', 'Fes', 'A_POSITIF'),
('Bargach', 'Leila', 'ZY678901', '1966-11-06', 'FEMININ', '0612000026', 'bargach.l@gmail.com', '109 Av Hassan I', 'Casablanca', 'AB_POSITIF'),
('Lamrani', 'Kamal', 'AB789013', '1979-04-23', 'MASCULIN', '0612000027', 'lamrani.k@gmail.com', '32 Rue Al Wifaq', 'Rabat', 'B_POSITIF'),
('Touzani', 'Wafae', 'CD890124', '1990-08-10', 'FEMININ', '0612000028', 'touzani.w@gmail.com', '65 Hay Al Fath', 'Marrakech', 'O_POSITIF'),
('Ennaji', 'Yassine', 'EF901235', '1974-12-27', 'MASCULIN', '0612000029', 'ennaji.y@gmail.com', '98 Rue Moulay Ali', 'Agadir', 'A_POSITIF'),
('Bouzidi', 'Hafida', 'GH012346', '1981-05-14', 'FEMININ', '0612000030', 'bouzidi.h@gmail.com', '20 Bd Roudani', 'Casablanca', 'B_NEGATIF'),
('Sebti', 'Noureddine', 'IJ123457', '1969-09-01', 'MASCULIN', '0612000031', 'sebti.n@gmail.com', '53 Rue Sebta', 'Tetouan', 'O_POSITIF'),
('Hajji', 'Siham', 'KL234568', '1988-02-18', 'FEMININ', '0612000032', 'hajji.s@gmail.com', '86 Av Al Amir', 'Rabat', 'A_POSITIF'),
('Zerhouni', 'Hamza', 'MN345679', '1995-06-05', 'MASCULIN', '0612000033', 'zerhouni.h@gmail.com', '19 Rue Ibn Rochd', 'Fes', 'AB_NEGATIF'),
('Mekouar', 'Sanaa', 'OP456780', '1972-10-22', 'FEMININ', '0612000034', 'mekouar.s@gmail.com', '52 Bd Al Qods', 'Casablanca', 'B_POSITIF'),
('Benkirane', 'Anas', 'QR567891', '1985-03-09', 'MASCULIN', '0612000035', 'benkirane.a@gmail.com', '85 Rue Moussa Ibn', 'Kenitra', 'O_POSITIF'),
('Raiss', 'Meryem', 'ST678902', '1992-07-26', 'FEMININ', '0612000036', 'raiss.m@gmail.com', '18 Hay Hassani', 'Casablanca', 'A_NEGATIF'),
('Benmoussa', 'Othmane', 'UV789013', '1978-11-13', 'MASCULIN', '0612000037', 'benmoussa.o@gmail.com', '51 Av Yacoub', 'Marrakech', 'B_POSITIF'),
('Laraichi', 'Ghita', 'WX890124', '1983-04-30', 'FEMININ', '0612000038', 'laraichi.g@gmail.com', '84 Rue Tafilalet', 'Agadir', 'O_POSITIF'),
('Mouline', 'Iliasse', 'YZ901235', '1991-08-17', 'MASCULIN', '0612000039', 'mouline.i@gmail.com', '17 Bd Massira', 'Rabat', 'A_POSITIF'),
('Tahiri', 'Najat', 'BA012346', '1967-12-04', 'FEMININ', '0612000040', 'tahiri.n@gmail.com', '50 Rue Lalla Yto', 'Sale', 'AB_POSITIF'),
('Filali', 'Rida', 'DC123457', '1980-05-21', 'MASCULIN', '0612000041', 'filali.r@gmail.com', '83 Av Al Massira', 'Fes', 'B_NEGATIF'),
('Benali', 'Ibtissam', 'FE234568', '1987-09-08', 'FEMININ', '0612000042', 'benali.i@gmail.com', '16 Hay Riyad', 'Rabat', 'O_POSITIF'),
('Alami', 'Soufiane', 'HG345679', '1975-01-25', 'MASCULIN', '0612000043', 'alami.s@gmail.com', '49 Rue Sidi Yahia', 'Oujda', 'A_POSITIF'),
('Moatassim', 'Hajar', 'JI456780', '1993-05-12', 'FEMININ', '0612000044', 'moatassim.h@gmail.com', '82 Bd Nations Unies', 'Casablanca', 'B_POSITIF'),
('Zeroual', 'Abdelilah', 'LK567891', '1970-09-29', 'MASCULIN', '0612000045', 'zeroual.a@gmail.com', '15 Rue Abdelaziz', 'Tanger', 'O_NEGATIF'),
('Khaldi', 'Bouchra', 'NM678902', '1984-02-16', 'FEMININ', '0612000046', 'khaldi.b@gmail.com', '48 Av Bir Anzarane', 'Laayoune', 'A_POSITIF'),
('Rhazi', 'Marouane', 'PO789013', '1996-06-03', 'MASCULIN', '0612000047', 'rhazi.m@gmail.com', '81 Rue Sebou', 'Kenitra', 'AB_POSITIF'),
('Bennis', 'Amina', 'RP890124', '1973-10-20', 'FEMININ', '0612000048', 'bennis.a@gmail.com', '14 Hay Annahda', 'Casablanca', 'B_POSITIF'),
('Jaidi', 'Zakaria', 'TS901235', '1982-03-07', 'MASCULIN', '0612000049', 'jaidi.z@gmail.com', '47 Bd Allal Fassi', 'Rabat', 'O_POSITIF'),
('Mernissi', 'Dounia', 'VU012346', '1989-07-24', 'FEMININ', '0612000050', 'mernissi.d@gmail.com', '80 Rue Ibn Sina', 'Fes', 'A_NEGATIF');

USE ms_appointment_db;

INSERT IGNORE INTO time_slots (doctor_id, service_id, start_time, end_time, status, created_at, updated_at) VALUES
(1, 1, '2026-05-05 09:00:00', '2026-05-05 09:30:00', 'Reserved', NOW(), NOW()),
(1, 1, '2026-05-05 09:30:00', '2026-05-05 10:00:00', 'Reserved', NOW(), NOW()),
(1, 1, '2026-05-05 10:00:00', '2026-05-05 10:30:00', 'Available', NOW(), NOW()),
(1, 1, '2026-05-05 10:30:00', '2026-05-05 11:00:00', 'Available', NOW(), NOW()),
(2, 2, '2026-05-05 08:00:00', '2026-05-05 08:30:00', 'Reserved', NOW(), NOW()),
(2, 2, '2026-05-05 08:30:00', '2026-05-05 09:00:00', 'Available', NOW(), NOW()),
(3, 1, '2026-05-06 09:00:00', '2026-05-06 09:30:00', 'Reserved', NOW(), NOW()),
(3, 1, '2026-05-06 09:30:00', '2026-05-06 10:00:00', 'Available', NOW(), NOW()),
(4, 3, '2026-05-06 10:00:00', '2026-05-06 10:30:00', 'Reserved', NOW(), NOW()),
(5, 5, '2026-05-07 11:00:00', '2026-05-07 11:30:00', 'Reserved', NOW(), NOW()),
(1, 1, '2026-05-08 09:00:00', '2026-05-08 09:30:00', 'Available', NOW(), NOW()),
(1, 1, '2026-05-08 09:30:00', '2026-05-08 10:00:00', 'Available', NOW(), NOW()),
(2, 2, '2026-05-08 08:00:00', '2026-05-08 08:30:00', 'Available', NOW(), NOW()),
(3, 1, '2026-05-09 09:00:00', '2026-05-09 09:30:00', 'Available', NOW(), NOW()),
(4, 3, '2026-05-09 10:00:00', '2026-05-09 10:30:00', 'Available', NOW(), NOW());

INSERT IGNORE INTO appointments (time_slot_id, patient_id, booked_by_id, reason, status, created_at, updated_at) VALUES
(1, 1, 1, 'Consultation cardiologie', 'Confirmed', NOW(), NOW()),
(2, 2, 2, 'Suivi tension arterielle', 'Confirmed', NOW(), NOW()),
(5, 3, 3, 'Urgence douleur thoracique', 'Confirmed', NOW(), NOW()),
(7, 4, 1, 'Bilan cardiaque', 'Confirmed', NOW(), NOW()),
(9, 5, 4, 'Consultation pediatrique', 'Confirmed', NOW(), NOW()),
(10, 6, 5, 'Consultation chirurgie', 'Confirmed', NOW(), NOW());
