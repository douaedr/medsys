package com.hospital.patient.config;

import com.hospital.patient.entity.*;
import com.hospital.patient.enums.GroupeSanguin;
import com.hospital.patient.enums.Sexe;
import com.hospital.patient.enums.TypeAntecedent;
import com.hospital.patient.repository.MedecinRepository;
import com.hospital.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;

/**
 * Crée les données de référence au démarrage si la base est vide.
 *
 * Patients de test :
 *   id=1  Karim Benali   (PAT001) → patient@medsys.ma
 *   id=2  Nadia El Amrani (PAT002) → patient2@medsys.ma
 *
 * Médecins de référence :
 *   id=1  Dr. Jean Dupont   (MED001) → medecin@medsys.ma
 *   id=2  Dr. Sophie Martin  (MED002) → medecin2@medsys.ma
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;

    @Override
    public void run(ApplicationArguments args) {
        initMedecins();
        initPatients();
    }

    private void initMedecins() {
        if (medecinRepository.count() == 0) {
            Medecin med1 = Medecin.builder()
                    .id(1L)
                    .nom("Dupont")
                    .prenom("Jean")
                    .matricule("MED001")
                    .build();
            medecinRepository.save(med1);
            log.info("[INIT] Médecin créé : Dr. Jean Dupont (id=1)");

            Medecin med2 = Medecin.builder()
                    .id(2L)
                    .nom("Martin")
                    .prenom("Sophie")
                    .matricule("MED002")
                    .build();
            medecinRepository.save(med2);
            log.info("[INIT] Médecin créé : Dr. Sophie Martin (id=2)");
        }
    }

    private void initPatients() {
        if (patientRepository.count() == 0) {
            // Patient 1 — Karim Benali
            DossierMedical dossier1 = new DossierMedical();
            Antecedent ant1 = Antecedent.builder()
                    .typeAntecedent(TypeAntecedent.ALLERGIQUE)
                    .description("Allergie à la pénicilline")
                    .actif(true)
                    .build();
            dossier1.getAntecedents().add(ant1);

            Patient p1 = Patient.builder()
                    .nom("Benali")
                    .prenom("Karim")
                    .cin("PAT001")
                    .dateNaissance(LocalDate.of(1990, 5, 15))
                    .sexe(Sexe.MASCULIN)
                    .groupeSanguin(GroupeSanguin.A_POSITIF)
                    .telephone("0612345678")
                    .email("patient@medsys.ma")
                    .adresse("123 Rue Mohammed V")
                    .ville("Oujda")
                    .mutuelle("CNOPS")
                    .dossierMedical(dossier1)
                    .build();
            patientRepository.save(p1);
            log.info("[INIT] Patient créé : Karim Benali (id={})", p1.getId());

            // Patient 2 — Nadia El Amrani
            DossierMedical dossier2 = new DossierMedical();

            Patient p2 = Patient.builder()
                    .nom("El Amrani")
                    .prenom("Nadia")
                    .cin("PAT002")
                    .dateNaissance(LocalDate.of(1988, 11, 3))
                    .sexe(Sexe.FEMININ)
                    .groupeSanguin(GroupeSanguin.O_POSITIF)
                    .telephone("0698765432")
                    .email("patient2@medsys.ma")
                    .adresse("45 Avenue Hassan II")
                    .ville("Oujda")
                    .dossierMedical(dossier2)
                    .build();
            patientRepository.save(p2);
            log.info("[INIT] Patient créé : Nadia El Amrani (id={})", p2.getId());
        }
    }
}
