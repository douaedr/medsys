-- ============================================================
--  SESSION 5 â€” Tables chef_service & emploi_du_temps
--  Base : ms_patient_db  |  XAMPP MySQL port 3307
-- ============================================================

USE ms_patient_db;

-- â”€â”€ 1. Table : chef_service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS chef_service (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    personnel_id BIGINT       NOT NULL UNIQUE COMMENT 'Un personnel ne peut Ãªtre chef que d''un seul service',
    service_id   VARCHAR(50)  NOT NULL UNIQUE COMMENT 'RÃ¨gle : 1 seul chef par service',
    nom_service  VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- â”€â”€ 2. Table : emploi_du_temps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS emploi_du_temps (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    personnel_id     BIGINT       NOT NULL COMMENT 'ID du membre du personnel',
    chef_service_id  BIGINT       NOT NULL COMMENT 'ID du chef qui a crÃ©Ã© ce crÃ©neau',
    service_id       VARCHAR(50)  NOT NULL,
    jour_semaine     VARCHAR(10)  NOT NULL COMMENT 'LUNDI | MARDI | ... | DIMANCHE',
    heure_debut      TIME         NOT NULL,
    heure_fin        TIME         NOT NULL,
    activite         VARCHAR(30)  NOT NULL COMMENT 'CONSULTATION | GARDE | REUNION | REPOS | AUTRE',
    salle            VARCHAR(50),
    CONSTRAINT chk_heures CHECK (heure_fin > heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- â”€â”€ 3. DonnÃ©es de dÃ©mo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- Chefs de service (utilisez les vrais IDs personnel de votre BD)
INSERT IGNORE INTO chef_service (personnel_id, service_id, nom_service) VALUES
(1, 'CARDIO',    'Cardiologie'),
(2, 'URGENCES',  'Urgences'),
(3, 'PEDIATRIE', 'PÃ©diatrie');

-- Emplois du temps de dÃ©mo
INSERT INTO emploi_du_temps (personnel_id, chef_service_id, service_id, jour_semaine, heure_debut, heure_fin, activite, salle) VALUES
-- Personnel 4 (cardio) â€” semaine type
(4, 1, 'CARDIO', 'LUNDI',    '08:00', '12:00', 'CONSULTATION', 'Salle 101'),
(4, 1, 'CARDIO', 'LUNDI',    '14:00', '17:00', 'CONSULTATION', 'Salle 101'),
(4, 1, 'CARDIO', 'MERCREDI', '08:00', '12:00', 'REUNION',      'Salle de rÃ©union'),
(4, 1, 'CARDIO', 'VENDREDI', '08:00', '20:00', 'GARDE',        'Urgences Cardio'),
-- Personnel 5 (urgences)
(5, 2, 'URGENCES', 'LUNDI',   '07:00', '19:00', 'GARDE',        'Urgences'),
(5, 2, 'URGENCES', 'JEUDI',   '07:00', '19:00', 'GARDE',        'Urgences'),
(5, 2, 'URGENCES', 'SAMEDI',  '07:00', '19:00', 'GARDE',        'Urgences'),
-- Personnel 6 (pÃ©diatrie)
(6, 3, 'PEDIATRIE', 'MARDI',   '09:00', '13:00', 'CONSULTATION', 'PÃ©diatrie A'),
(6, 3, 'PEDIATRIE', 'JEUDI',   '09:00', '13:00', 'CONSULTATION', 'PÃ©diatrie A'),
(6, 3, 'PEDIATRIE', 'VENDREDI','14:00', '18:00', 'CONSULTATION', 'PÃ©diatrie B');

SELECT 'Tables et donnÃ©es de dÃ©mo crÃ©Ã©es avec succÃ¨s !' AS statut;
