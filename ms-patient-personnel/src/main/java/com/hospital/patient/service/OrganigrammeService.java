package com.hospital.patient.service;

import com.hospital.patient.client.AuthServiceClient;
import com.hospital.patient.dto.CollegueDTO;
import com.hospital.patient.dto.OrganigrammeDTO;
import com.hospital.patient.entity.Medecin;
import com.hospital.patient.entity.Service;
import com.hospital.patient.repository.MedecinRepository;
import com.hospital.patient.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrganigrammeService {

    private final ServiceRepository serviceRepository;
    private final MedecinRepository medecinRepository;
    private final AuthServiceClient authClient;

    public OrganigrammeDTO build() {
        List<CollegueDTO> allUsers = authClient.getAllUsers();

        OrganigrammeDTO.NodeDTO directeur = allUsers.stream()
                .filter(u -> "DIRECTEUR".equalsIgnoreCase(u.getRole()))
                .findFirst()
                .map(this::userToNode)
                .orElse(null);

        List<Service> services = serviceRepository.findAll();
        List<OrganigrammeDTO.ServiceNodeDTO> serviceNodes = new ArrayList<>();

        for (Service svc : services) {
            // Médecins du service (depuis medecins_ref)
            List<Medecin> medecinsDuService = medecinRepository.findByService_Id(svc.getId());

            OrganigrammeDTO.NodeDTO chefNode = null;
            List<OrganigrammeDTO.NodeDTO> medecinsNodes = new ArrayList<>();
            for (Medecin m : medecinsDuService) {
                OrganigrammeDTO.NodeDTO node = medecinToNode(m, allUsers);
                if (svc.getChefId() != null && svc.getChefId().equals(m.getId())) {
                    chefNode = node;
                } else {
                    medecinsNodes.add(node);
                }
            }

            // Personnel non-médecin : on filtre par rôle (pas de notion de service côté ms-auth pour l'instant).
            // Les listes secrétaires/infirmiers/etc. retournent TOUT le personnel de chaque rôle, faute d'info de rattachement.
            // C'est mentionné dans le README — à raffiner si vous ajoutez un champ serviceId à UserAccount.
            List<OrganigrammeDTO.NodeDTO> secretaires = collectByRole(allUsers, "SECRETARY");
            List<OrganigrammeDTO.NodeDTO> personnel = collectByRole(allUsers, "PERSONNEL");

            // Pour simplicité, on met TOUT PERSONNEL dans "infirmiers" (on n'a pas la sous-distinction côté DB).
            // Le frontend pourra raffiner si un sous-rôle est ajouté.
            serviceNodes.add(OrganigrammeDTO.ServiceNodeDTO.builder()
                    .id(svc.getId())
                    .nom(svc.getNom())
                    .code(svc.getCode())
                    .localisation(svc.getLocalisation())
                    .chef(chefNode)
                    .medecins(medecinsNodes)
                    .secretaires(secretaires)
                    .infirmiers(personnel)
                    .aidesSoignants(Collections.emptyList())
                    .brancardiers(Collections.emptyList())
                    .build());
        }

        return OrganigrammeDTO.builder()
                .directeur(directeur)
                .services(serviceNodes)
                .build();
    }

    /* ────── Helpers ────── */

    private OrganigrammeDTO.NodeDTO userToNode(CollegueDTO u) {
        return OrganigrammeDTO.NodeDTO.builder()
                .id(u.getUserId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .role(u.getRole())
                .email(u.getEmail())
                .build();
    }

    private OrganigrammeDTO.NodeDTO medecinToNode(Medecin m, List<CollegueDTO> users) {
        // Tente de trouver l'email/role via le lien personnelId ↔ medecins_ref.id
        CollegueDTO match = users.stream()
                .filter(u -> m.getId().equals(u.getPersonnelId()))
                .findFirst()
                .orElse(null);
        return OrganigrammeDTO.NodeDTO.builder()
                .id(m.getId())
                .nom(m.getNom())
                .prenom(m.getPrenom())
                .role(match != null ? match.getRole() : "MEDECIN")
                .email(match != null ? match.getEmail() : null)
                .build();
    }

    private List<OrganigrammeDTO.NodeDTO> collectByRole(List<CollegueDTO> users, String role) {
        List<OrganigrammeDTO.NodeDTO> list = new ArrayList<>();
        for (CollegueDTO u : users) {
            if (role.equalsIgnoreCase(u.getRole())) {
                list.add(userToNode(u));
            }
        }
        return list;
    }
}
