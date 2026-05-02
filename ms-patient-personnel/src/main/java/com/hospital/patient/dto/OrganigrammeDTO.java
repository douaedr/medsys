package com.hospital.patient.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganigrammeDTO {

    private NodeDTO directeur;
    private List<ServiceNodeDTO> services;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String role;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceNodeDTO {
        private Long id;
        private String nom;
        private String code;
        private String localisation;
        private NodeDTO chef;
        private List<NodeDTO> medecins;
        private List<NodeDTO> secretaires;
        private List<NodeDTO> infirmiers;
        private List<NodeDTO> aidesSoignants;
        private List<NodeDTO> brancardiers;
    }
}
