// ===== Enums =====
export enum Statut {
  ACTIF = 0,
  EN_CONGE = 1,
  SUSPENDU = 2,
  EN_FORMATION = 3,
}

export enum TypeMedecin {
  MEDECIN = 0,
  MEDECIN_JUNIOR = 1,
  MEDECIN_SENIOR = 2,
  CHEF_DE_SERVICE = 3,
}

export enum TypeInfirmier {
  INFIRMIER = 0,
  INFIRMIER_MAJORANT = 1,
}

export enum Periodicite {
  QUOTIDIEN = 0,
  HEBDOMADAIRE = 1,
  MENSUEL = 2,
  BIMENSUEL = 3,
}

export enum StatutPlanning {
  BROUILLON = 0,
  EN_VALIDATION = 1,
  VALIDE = 2,
  PUBLIE = 3,
  ARCHIVE = 4,
}

export enum TypeCreneau {
  MATIN = 0,
  APRES_MIDI = 1,
  NUIT = 2,
  JOURNEE = 3,
}

export enum StatutCreneau {
  PLANIFIE = 0,
  CONFIRME = 1,
  EN_COURS = 2,
  TERMINE = 3,
  ANNULE = 4,
}

export enum TypeAbsence {
  CONGE_ANNUEL = 0,
  MALADIE = 1,
  FORMATION = 2,
  MATERNITE = 3,
  AUTRE = 4,
}

export enum StatutAbsence {
  EN_ATTENTE = 0,
  APPROUVE = 1,
  REFUSE = 2,
  ANNULE = 3,
}

export enum TypeDemande {
  ECHANGE = 0,
  MODIFICATION = 1,
  ANNULATION = 2,
}

export enum StatutDemande {
  EN_ATTENTE = 0,
  APPROUVEE = 1,
  REJETEE = 2,
}

// ===== Personnel =====
export interface PersonnelDto {
  id: string;
  nom: string;
  prenom: string;
  courriel: string;
  telephone: string | null;
  matricule: string;
  statut: Statut;
  dateEmbauche: string;
  poste: string;
  type: string;
}

export interface PersonnelCreateDto {
  nom: string;
  prenom: string;
  courriel: string;
  telephone?: string;
  matricule: string;
  statut: Statut;
  dateEmbauche: string;
  poste: string;
}

export interface PersonnelUpdateDto extends PersonnelCreateDto {}

// ===== Médecin =====
export interface MedecinDto extends PersonnelDto {
  typeMedecin: TypeMedecin;
  specialite: string;
  numeroOrdre: string;
  anneeExperience?: number;
  departement?: string;
}

export interface MedecinCreateDto extends PersonnelCreateDto {
  type: TypeMedecin;
  specialite: string;
  numeroOrdre: string;
  anneeExperience?: number;
  departement?: string;
}

// ===== Infirmier =====
export interface InfirmierDto extends PersonnelDto {
  typeInfirmier: TypeInfirmier;
  service?: string;
  uniteSoins?: string;
}

export interface InfirmierCreateDto extends PersonnelCreateDto {
  type: TypeInfirmier;
  service?: string;
  uniteSoins?: string;
}

// ===== AideSoignant =====
export interface AideSoignantDto extends PersonnelDto {
  unite: string;
}

export interface AideSoignantCreateDto extends PersonnelCreateDto {
  unite: string;
}

// ===== Brancardier =====
export interface BrancardierDto extends PersonnelDto {
  zoneCouverture: string;
}

export interface BrancardierCreateDto extends PersonnelCreateDto {
  zoneCouverture: string;
}

// ===== Secrétaire =====
export interface SecretaireDto extends PersonnelDto {}
export interface SecretaireCreateDto extends PersonnelCreateDto {}

// ===== Directeur =====
export interface DirecteurDto extends PersonnelDto {}
export interface DirecteurCreateDto extends PersonnelCreateDto {}

// ===== Équipe =====
export interface EquipeDto {
  id: string;
  nom: string;
  periodicite: Periodicite;
  effectifCible: number;
  effectifMinimum: number;
  chefEquipeId?: string;
  encadrantId?: string;
  chefDeServiceId?: string;
  membreIds: string[];
  membres?: PersonnelDto[];
}

export interface EquipeCreateDto {
  nom: string;
  periodicite: Periodicite;
  effectifCible: number;
  effectifMinimum: number;
  chefEquipeId?: string;
  encadrantId?: string;
  chefDeServiceId?: string;
  membreIds: string[];
}

// ===== Planning =====
export interface PlanningDto {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutPlanning;
  equipeId: string;
  equipe?: EquipeDto;
}

export interface PlanningCreateDto {
  nom: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutPlanning;
  equipeId: string;
}

// ===== Créneau =====
export interface CreneauDto {
  id: string;
  debut: string;
  fin: string;
  type: TypeCreneau;
  statut: StatutCreneau;
  lieu?: string;
  personnelIds: string[];
  personnel?: PersonnelDto[];
  planningId: string;
}

export interface CreneauCreateDto {
  debut: string;
  fin: string;
  type: TypeCreneau;
  statut: StatutCreneau;
  lieu?: string;
  personnelIds: string[];
  planningId: string;
}

// ===== Disponibilité =====
export interface DisponibiliteDto {
  id: string;
  jour: number;
  heureDebut: string;
  heureFin: string;
  priorite: number;
  personnelId: string;
}

export interface DisponibiliteCreateDto {
  jour: number;
  heureDebut: string;
  heureFin: string;
  priorite: number;
  personnelId: string;
}

// ===== Absence =====
export interface AbsenceDto {
  id: string;
  type: TypeAbsence;
  dateDebut: string;
  dateFin: string;
  motif: string;
  justificatif?: string;
  statut: StatutAbsence;
  personnelId: string;
  personnel?: PersonnelDto;
  commentaire?: string;
}

export interface AbsenceCreateDto {
  type: TypeAbsence;
  dateDebut: string;
  dateFin: string;
  motif: string;
  justificatif?: string;
  personnelId: string;
}

// ===== Demande de modification =====
export interface DemandeModificationDto {
  id: string;
  type: TypeDemande;
  motif: string;
  statut: StatutDemande;
  personnelId: string;
  personnel?: PersonnelDto;
  creneauIds: string[];
  commentaire?: string;
}

export interface DemandeModificationCreateDto {
  type: TypeDemande;
  motif: string;
  personnelId: string;
  creneauIds: string[];
}

// ===== Pagination =====
export interface PageResult<T> {
  items: T[];
  page: number;
  taillePage: number;
  total: number;
  totalPages: number;
}

// ===== Rapports =====
export interface EffectifParServiceDto {
  service: string;
  count: number;
}

export interface AbsencesParMoisDto {
  mois: number;
  count: number;
}

export interface TauxOccupationDto {
  taux: number;
  equipeId?: string;
}

export interface RepartitionStatutDto {
  statut: Statut;
  count: number;
}

export interface DemandesEnAttenteDto {
  count: number;
}

// ===== Labels helpers =====
export const STATUT_LABELS: Record<Statut, string> = {
  [Statut.ACTIF]: 'Actif',
  [Statut.EN_CONGE]: 'En congé',
  [Statut.SUSPENDU]: 'Suspendu',
  [Statut.EN_FORMATION]: 'En formation',
};

export const STATUT_COLORS: Record<Statut, string> = {
  [Statut.ACTIF]: 'bg-emerald-100 text-emerald-800',
  [Statut.EN_CONGE]: 'bg-amber-100 text-amber-800',
  [Statut.SUSPENDU]: 'bg-red-100 text-red-800',
  [Statut.EN_FORMATION]: 'bg-blue-100 text-blue-800',
};

export const TYPE_MEDECIN_LABELS: Record<TypeMedecin, string> = {
  [TypeMedecin.MEDECIN]: 'Médecin',
  [TypeMedecin.MEDECIN_JUNIOR]: 'Médecin Junior',
  [TypeMedecin.MEDECIN_SENIOR]: 'Médecin Sénior',
  [TypeMedecin.CHEF_DE_SERVICE]: 'Chef de Service',
};

export const TYPE_INFIRMIER_LABELS: Record<TypeInfirmier, string> = {
  [TypeInfirmier.INFIRMIER]: 'Infirmier',
  [TypeInfirmier.INFIRMIER_MAJORANT]: 'Infirmier Majorant',
};

export const PERIODICITE_LABELS: Record<Periodicite, string> = {
  [Periodicite.QUOTIDIEN]: 'Quotidien',
  [Periodicite.HEBDOMADAIRE]: 'Hebdomadaire',
  [Periodicite.MENSUEL]: 'Mensuel',
  [Periodicite.BIMENSUEL]: 'Bimensuel',
};

export const STATUT_PLANNING_LABELS: Record<StatutPlanning, string> = {
  [StatutPlanning.BROUILLON]: 'Brouillon',
  [StatutPlanning.EN_VALIDATION]: 'En validation',
  [StatutPlanning.VALIDE]: 'Validé',
  [StatutPlanning.PUBLIE]: 'Publié',
  [StatutPlanning.ARCHIVE]: 'Archivé',
};

export const STATUT_PLANNING_COLORS: Record<StatutPlanning, string> = {
  [StatutPlanning.BROUILLON]: 'bg-slate-100 text-slate-700',
  [StatutPlanning.EN_VALIDATION]: 'bg-amber-100 text-amber-800',
  [StatutPlanning.VALIDE]: 'bg-emerald-100 text-emerald-800',
  [StatutPlanning.PUBLIE]: 'bg-blue-100 text-blue-800',
  [StatutPlanning.ARCHIVE]: 'bg-gray-100 text-gray-600',
};

export const TYPE_CRENEAU_LABELS: Record<TypeCreneau, string> = {
  [TypeCreneau.MATIN]: 'Matin',
  [TypeCreneau.APRES_MIDI]: 'Après-midi',
  [TypeCreneau.NUIT]: 'Nuit',
  [TypeCreneau.JOURNEE]: 'Journée',
};

export const STATUT_CRENEAU_LABELS: Record<StatutCreneau, string> = {
  [StatutCreneau.PLANIFIE]: 'Planifié',
  [StatutCreneau.CONFIRME]: 'Confirmé',
  [StatutCreneau.EN_COURS]: 'En cours',
  [StatutCreneau.TERMINE]: 'Terminé',
  [StatutCreneau.ANNULE]: 'Annulé',
};

export const STATUT_CRENEAU_COLORS: Record<StatutCreneau, string> = {
  [StatutCreneau.PLANIFIE]: 'bg-slate-100 text-slate-700',
  [StatutCreneau.CONFIRME]: 'bg-blue-100 text-blue-800',
  [StatutCreneau.EN_COURS]: 'bg-amber-100 text-amber-800',
  [StatutCreneau.TERMINE]: 'bg-emerald-100 text-emerald-800',
  [StatutCreneau.ANNULE]: 'bg-red-100 text-red-800',
};

export const TYPE_ABSENCE_LABELS: Record<TypeAbsence, string> = {
  [TypeAbsence.CONGE_ANNUEL]: 'Congé annuel',
  [TypeAbsence.MALADIE]: 'Maladie',
  [TypeAbsence.FORMATION]: 'Formation',
  [TypeAbsence.MATERNITE]: 'Maternité',
  [TypeAbsence.AUTRE]: 'Autre',
};

export const STATUT_ABSENCE_LABELS: Record<StatutAbsence, string> = {
  [StatutAbsence.EN_ATTENTE]: 'En attente',
  [StatutAbsence.APPROUVE]: 'Approuvé',
  [StatutAbsence.REFUSE]: 'Refusé',
  [StatutAbsence.ANNULE]: 'Annulé',
};

export const STATUT_ABSENCE_COLORS: Record<StatutAbsence, string> = {
  [StatutAbsence.EN_ATTENTE]: 'bg-amber-100 text-amber-800',
  [StatutAbsence.APPROUVE]: 'bg-emerald-100 text-emerald-800',
  [StatutAbsence.REFUSE]: 'bg-red-100 text-red-800',
  [StatutAbsence.ANNULE]: 'bg-gray-100 text-gray-600',
};

export const TYPE_DEMANDE_LABELS: Record<TypeDemande, string> = {
  [TypeDemande.ECHANGE]: 'Échange',
  [TypeDemande.MODIFICATION]: 'Modification',
  [TypeDemande.ANNULATION]: 'Annulation',
};

export const STATUT_DEMANDE_LABELS: Record<StatutDemande, string> = {
  [StatutDemande.EN_ATTENTE]: 'En attente',
  [StatutDemande.APPROUVEE]: 'Approuvée',
  [StatutDemande.REJETEE]: 'Rejetée',
};

export const STATUT_DEMANDE_COLORS: Record<StatutDemande, string> = {
  [StatutDemande.EN_ATTENTE]: 'bg-amber-100 text-amber-800',
  [StatutDemande.APPROUVEE]: 'bg-emerald-100 text-emerald-800',
  [StatutDemande.REJETEE]: 'bg-red-100 text-red-800',
};

export const JOURS_SEMAINE = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
