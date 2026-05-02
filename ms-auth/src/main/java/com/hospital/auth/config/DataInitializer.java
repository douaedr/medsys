package com.hospital.auth.config;

import com.hospital.auth.entity.UserAccount;
import com.hospital.auth.enums.Role;
import com.hospital.auth.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crée les comptes par défaut au démarrage si absents.
 *
 * Mot de passe unifié pour TOUS les comptes de test : Admin1234!
 *
 * PERSONNEL HOSPITALIER — connexion sur /login/personnel :
 *   admin@medsys.ma          (ADMIN)
 *   directeur@medsys.ma      (DIRECTEUR)
 *   medecin@medsys.ma        (MEDECIN)
 *   medecin2@medsys.ma       (MEDECIN — 2e médecin)
 *   secretaire@medsys.ma     (SECRETARY — assignée au médecin 1)
 *   infirmier@medsys.ma      (PERSONNEL — infirmier/ière)
 *   aidesoignant@medsys.ma   (PERSONNEL — aide soignant)
 *   brancardier@medsys.ma    (PERSONNEL — brancardier)
 *
 * ESPACE PATIENT — connexion sur /patient :
 *   patient@medsys.ma        (PATIENT — patientId=1)
 *   patient2@medsys.ma       (PATIENT — patientId=2)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    // Mot de passe unifié
    private static final String DEFAULT_PASSWORD = "Admin1234!";

    @Override
    public void run(ApplicationArguments args) {
        // Comptes administration
        createIfNotExists("admin@medsys.ma",         "Admin",      "System",    Role.ADMIN,      "ADMIN001", null, null);
        createIfNotExists("directeur@medsys.ma",     "Directeur",  "Hopital",   Role.DIRECTEUR,  "DIR001",   null, null);

        // Médecins (créés avant la secrétaire pour récupérer leur ID)
        UserAccount med1 = createIfNotExists("medecin@medsys.ma",  "Dupont",  "Jean",   Role.MEDECIN, "MED001", null, null);
        createIfNotExists("medecin2@medsys.ma", "Martin", "Sophie", Role.MEDECIN, "MED002", null, null);

        // Secrétaire — assignée au médecin 1
        Long medecinAssigneId = med1 != null ? med1.getId() : null;
        createIfNotExists("secretaire@medsys.ma", "Alami", "Fatima", Role.SECRETARY, "SEC001", medecinAssigneId, null);

        // Personnel paramédical
        createIfNotExists("infirmier@medsys.ma",    "Benali",  "Youssef", Role.PERSONNEL, "INF001", null, null);
        createIfNotExists("aidesoignant@medsys.ma", "Chraibi", "Aicha",   Role.PERSONNEL, "AID001", null, null);
        createIfNotExists("brancardier@medsys.ma",  "Fassi",   "Omar",    Role.PERSONNEL, "BRA001", null, null);

        // Comptes patients de test — patientId correspondant à l'ID dans ms-patient-personnel
        createIfNotExists("patient@medsys.ma",  "Benali",    "Karim",  Role.PATIENT, "PAT001", null, 1L);
        createIfNotExists("patient2@medsys.ma", "El Amrani", "Nadia",  Role.PATIENT, "PAT002", null, 2L);
    }

    private UserAccount createIfNotExists(String email, String nom, String prenom,
                                          Role role, String cin,
                                          Long medecinAssigneId, Long patientId) {
        if (userRepo.existsByEmail(email)) {
            // Mettre à jour le patientId si manquant pour les patients existants
            UserAccount existing = userRepo.findByEmail(email).orElse(null);
            if (existing != null && patientId != null && existing.getPatientId() == null) {
                existing.setPatientId(patientId);
                userRepo.save(existing);
                log.info("[INIT] PatientId mis à jour pour {} : patientId={}", email, patientId);
            }
            return existing;
        }

        UserAccount user = UserAccount.builder()
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .nom(nom)
                .prenom(prenom)
                .cin(cin)
                .role(role)
                .enabled(true)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .medecinAssigneId(medecinAssigneId)
                .patientId(patientId)
                .build();

        UserAccount saved = userRepo.save(user);
        log.info("[INIT] Compte {} créé : {} (id={}, patientId={})", role, email, saved.getId(), patientId);
        return saved;
    }
}
