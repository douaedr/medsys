import apiClient from './apiClient';
import type {
  PersonnelDto, PersonnelCreateDto, PersonnelUpdateDto,
  MedecinDto, MedecinCreateDto,
  InfirmierDto, InfirmierCreateDto,
  AideSoignantDto, AideSoignantCreateDto,
  BrancardierDto, BrancardierCreateDto,
  SecretaireDto, SecretaireCreateDto,
  DirecteurDto, DirecteurCreateDto,
  EquipeDto, EquipeCreateDto,
  PlanningDto, PlanningCreateDto,
  CreneauDto, CreneauCreateDto,
  DisponibiliteDto, DisponibiliteCreateDto,
  AbsenceDto, AbsenceCreateDto,
  DemandeModificationDto, DemandeModificationCreateDto,
  PageResult,
} from '../types';

// ===== Personnel =====
export const personnelService = {
  getAll: (params?: { page?: number; taillePage?: number; trierPar?: string; ordreTri?: string; statut?: number }) =>
    apiClient.get<PageResult<PersonnelDto>>('/api/Personnel', { params }),
  getById: (id: string) => apiClient.get<PersonnelDto>(`/api/Personnel/${id}`),
  create: (data: PersonnelCreateDto) => apiClient.post<PersonnelDto>('/api/Personnel', data),
  update: (id: string, data: PersonnelUpdateDto) => apiClient.put<PersonnelDto>(`/api/Personnel/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Personnel/${id}`),
};

// ===== Médecins =====
export const medecinService = {
  getAll: (params?: any) => apiClient.get<MedecinDto[]>('/api/Medecins', { params }),
  getById: (id: string) => apiClient.get<MedecinDto>(`/api/Medecins/${id}`),
  create: (data: MedecinCreateDto) => apiClient.post<MedecinDto>('/api/Medecins', data),
  update: (id: string, data: Partial<MedecinCreateDto>) => apiClient.put<MedecinDto>(`/api/Medecins/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Medecins/${id}`),
};

// ===== Infirmiers =====
export const infirmierService = {
  getAll: (params?: any) => apiClient.get<InfirmierDto[]>('/api/Infirmiers', { params }),
  getById: (id: string) => apiClient.get<InfirmierDto>(`/api/Infirmiers/${id}`),
  create: (data: InfirmierCreateDto) => apiClient.post<InfirmierDto>('/api/Infirmiers', data),
  update: (id: string, data: Partial<InfirmierCreateDto>) => apiClient.put<InfirmierDto>(`/api/Infirmiers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Infirmiers/${id}`),
};

// ===== Aides-soignants =====
export const aideSoignantService = {
  getAll: () => apiClient.get<AideSoignantDto[]>('/api/AidesSoignants'),
  getById: (id: string) => apiClient.get<AideSoignantDto>(`/api/AidesSoignants/${id}`),
  create: (data: AideSoignantCreateDto) => apiClient.post<AideSoignantDto>('/api/AidesSoignants', data),
  update: (id: string, data: Partial<AideSoignantCreateDto>) => apiClient.put<AideSoignantDto>(`/api/AidesSoignants/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/AidesSoignants/${id}`),
};

// ===== Brancardiers =====
export const brancardierService = {
  getAll: () => apiClient.get<BrancardierDto[]>('/api/Brancardiers'),
  getById: (id: string) => apiClient.get<BrancardierDto>(`/api/Brancardiers/${id}`),
  create: (data: BrancardierCreateDto) => apiClient.post<BrancardierDto>('/api/Brancardiers', data),
  update: (id: string, data: Partial<BrancardierCreateDto>) => apiClient.put<BrancardierDto>(`/api/Brancardiers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Brancardiers/${id}`),
};

// ===== Secrétaires =====
export const secretaireService = {
  getAll: () => apiClient.get<SecretaireDto[]>('/api/Secretaires'),
  getById: (id: string) => apiClient.get<SecretaireDto>(`/api/Secretaires/${id}`),
  create: (data: SecretaireCreateDto) => apiClient.post<SecretaireDto>('/api/Secretaires', data),
  update: (id: string, data: Partial<SecretaireCreateDto>) => apiClient.put<SecretaireDto>(`/api/Secretaires/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Secretaires/${id}`),
};

// ===== Directeurs =====
export const directeurService = {
  getAll: () => apiClient.get<DirecteurDto[]>('/api/Directeurs'),
  getById: (id: string) => apiClient.get<DirecteurDto>(`/api/Directeurs/${id}`),
  create: (data: DirecteurCreateDto) => apiClient.post<DirecteurDto>('/api/Directeurs', data),
  update: (id: string, data: Partial<DirecteurCreateDto>) => apiClient.put<DirecteurDto>(`/api/Directeurs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Directeurs/${id}`),
};

// ===== Équipes =====
export const equipeService = {
  getAll: (params?: { page?: number; taillePage?: number }) =>
    apiClient.get<PageResult<EquipeDto>>('/api/Equipes', { params }),
  getById: (id: string) => apiClient.get<EquipeDto>(`/api/Equipes/${id}`),
  create: (data: EquipeCreateDto) => apiClient.post<EquipeDto>('/api/Equipes', data),
  update: (id: string, data: EquipeCreateDto) => apiClient.put<EquipeDto>(`/api/Equipes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Equipes/${id}`),
  addMembre: (id: string, personnelId: string) =>
    apiClient.post(`/api/Equipes/${id}/membres`, { personnelId }),
  removeMembre: (id: string, personnelId: string) =>
    apiClient.delete(`/api/Equipes/${id}/membres/${personnelId}`),
  verifierEffectif: (id: string) => apiClient.get(`/api/Equipes/${id}/verifier-effectif`),
};

// ===== Plannings =====
export const planningService = {
  getAll: (params?: { page?: number; taillePage?: number; equipeId?: string; statut?: number }) =>
    apiClient.get<PageResult<PlanningDto>>('/api/Plannings', { params }),
  getById: (id: string) => apiClient.get<PlanningDto>(`/api/Plannings/${id}`),
  create: (data: PlanningCreateDto) => apiClient.post<PlanningDto>('/api/Plannings', data),
  update: (id: string, data: PlanningCreateDto) => apiClient.put<PlanningDto>(`/api/Plannings/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Plannings/${id}`),
  enValidation: (id: string, utilisateurId: string) =>
    apiClient.post(`/api/Plannings/${id}/en-validation`, { utilisateurId }),
  valider: (id: string) => apiClient.post(`/api/Plannings/${id}/valider`),
  publier: (id: string) => apiClient.post(`/api/Plannings/${id}/publier`),
  archiver: (id: string) => apiClient.post(`/api/Plannings/${id}/archiver`),
  getConflits: (id: string) => apiClient.get(`/api/Plannings/${id}/conflits`),
  getCouverture: (id: string) => apiClient.get(`/api/Plannings/${id}/couverture`),
};

// ===== Créneaux =====
export const creneauService = {
  getAll: (params?: { planningId?: string; personnelId?: string; dateDebut?: string; dateFin?: string }) =>
    apiClient.get<CreneauDto[]>('/api/Creneaux', { params }),
  getById: (id: string) => apiClient.get<CreneauDto>(`/api/Creneaux/${id}`),
  create: (data: CreneauCreateDto) => apiClient.post<CreneauDto>('/api/Creneaux', data),
  update: (id: string, data: CreneauCreateDto) => apiClient.put<CreneauDto>(`/api/Creneaux/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Creneaux/${id}`),
  affecter: (id: string, personnelId: string, utilisateurId: string) =>
    apiClient.post(`/api/Creneaux/${id}/affecter`, { personnelId, utilisateurId }),
  desaffecter: (id: string, personnelId: string, utilisateurId: string) =>
    apiClient.delete(`/api/Creneaux/${id}/affecter/${personnelId}`, { data: { utilisateurId } }),
  confirmer: (id: string) => apiClient.post(`/api/Creneaux/${id}/confirmer`),
  commencer: (id: string) => apiClient.post(`/api/Creneaux/${id}/commencer`),
  terminer: (id: string) => apiClient.post(`/api/Creneaux/${id}/terminer`),
  annuler: (id: string) => apiClient.post(`/api/Creneaux/${id}/annuler`),
};

// ===== Disponibilités =====
export const disponibiliteService = {
  getAll: () => apiClient.get<DisponibiliteDto[]>('/api/disponibilites'),
  getById: (id: string) => apiClient.get<DisponibiliteDto>(`/api/disponibilites/${id}`),
  getByPersonnel: (personnelId: string) =>
    apiClient.get<DisponibiliteDto[]>(`/api/disponibilites/personnel/${personnelId}`),
  create: (data: DisponibiliteCreateDto) => apiClient.post<DisponibiliteDto>('/api/disponibilites', data),
  update: (id: string, data: DisponibiliteCreateDto) =>
    apiClient.put<DisponibiliteDto>(`/api/disponibilites/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/disponibilites/${id}`),
};

// ===== Absences =====
export const absenceService = {
  getAll: (params?: { personnelId?: string; statut?: number }) =>
    apiClient.get<AbsenceDto[]>('/api/absences', { params }),
  getById: (id: string) => apiClient.get<AbsenceDto>(`/api/absences/${id}`),
  getByPersonnel: (personnelId: string) =>
    apiClient.get<AbsenceDto[]>(`/api/absences/personnel/${personnelId}`),
  getEnAttente: () => apiClient.get<AbsenceDto[]>('/api/absences/en-attente'),
  create: (data: AbsenceCreateDto) => apiClient.post<AbsenceDto>('/api/absences', data),
  update: (id: string, data: AbsenceCreateDto) => apiClient.put<AbsenceDto>(`/api/absences/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/absences/${id}`),
  approuver: (id: string, valideurId: string, commentaire?: string) =>
    apiClient.post(`/api/absences/${id}/approuver`, { valideurId, commentaire }),
  refuser: (id: string) => apiClient.post(`/api/absences/${id}/refuser`),
  annuler: (id: string) => apiClient.post(`/api/absences/${id}/annuler`),
};

// ===== Demandes de modification =====
export const demandeService = {
  getAll: () => apiClient.get<DemandeModificationDto[]>('/api/demandes-modification'),
  getById: (id: string) => apiClient.get<DemandeModificationDto>(`/api/demandes-modification/${id}`),
  getByPersonnel: (personnelId: string) =>
    apiClient.get<DemandeModificationDto[]>(`/api/demandes-modification/personnel/${personnelId}`),
  getEnAttente: () => apiClient.get<DemandeModificationDto[]>('/api/demandes-modification/en-attente'),
  create: (data: DemandeModificationCreateDto) =>
    apiClient.post<DemandeModificationDto>('/api/demandes-modification', data),
  update: (id: string, data: DemandeModificationCreateDto) =>
    apiClient.put<DemandeModificationDto>(`/api/demandes-modification/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/demandes-modification/${id}`),
  approuver: (id: string, valideurId: string, commentaire?: string) =>
    apiClient.post(`/api/demandes-modification/${id}/approuver`, { valideurId, commentaire }),
  rejeter: (id: string) => apiClient.post(`/api/demandes-modification/${id}/rejeter`),
};

// ===== Rapports =====
export const rapportService = {
  effectifParService: () => apiClient.get('/api/rapports/effectif-par-service'),
  absencesParMois: (annee: number) =>
    apiClient.get('/api/rapports/absences-par-mois', { params: { annee } }),
  tauxOccupation: (params?: { equipeId?: string; dateDebut?: string; dateFin?: string }) =>
    apiClient.get('/api/rapports/taux-occupation', { params }),
  repartitionStatut: () => apiClient.get('/api/rapports/repartition-statut'),
  demandesEnAttente: () => apiClient.get('/api/rapports/demandes-en-attente'),
};
