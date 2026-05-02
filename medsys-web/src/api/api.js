import axios from 'axios'

const AUTH_API = axios.create({ baseURL: '/api/v1/auth' })
const PATIENT_API = axios.create({ baseURL: '/api/v1' })
const ADMIN_API = axios.create({ baseURL: '/api/v1/admin' })
const CHATBOT_API = axios.create({ baseURL: '/api/v1/chatbot' })

// Intercepteur token
const withAuth = (api) => {
  api.interceptors.request.use(cfg => {
    const token = sessionStorage.getItem('medsys_token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
  })
  return api
}

withAuth(AUTH_API)
withAuth(PATIENT_API)
withAuth(ADMIN_API)
withAuth(CHATBOT_API)

export const authApi = {
  login: (data) => AUTH_API.post('/login', data),
  register: (data) => AUTH_API.post('/register', data),
  forgotPassword: (email) => AUTH_API.post('/forgot-password', { email }),
  resetPassword: (data) => AUTH_API.post('/reset-password', data),
  changePassword: (data) => AUTH_API.post('/change-password', data),
  changeEmail: (data) => AUTH_API.post('/change-email', data),
  verify: (token) => AUTH_API.get(`/verify?token=${token}`),
  me: () => AUTH_API.get('/me'),
}

export const patientApi = {
  getAll: (params) => PATIENT_API.get('/patients', { params }),
  getById: (id) => PATIENT_API.get(`/patients/${id}`),
  create: (data) => PATIENT_API.post('/patients', data),
  update: (id, data) => PATIENT_API.put(`/patients/${id}`, data),
  delete: (id) => PATIENT_API.delete(`/patients/${id}`),
  search: (q, params) => PATIENT_API.get('/patients/search', { params: { q, ...params } }),
  stats: () => PATIENT_API.get('/patients/statistiques'),

  me: () => PATIENT_API.get('/patient/me'),
  updateMe: (data) => PATIENT_API.patch('/patient/me', data),
  myDossier: () => PATIENT_API.get('/patient/me/dossier'),
  dossier: (id) => PATIENT_API.get(`/patients/${id}/dossier`),

  notifications: () => PATIENT_API.get('/patient/me/notifications'),

  exportPdf: () => PATIENT_API.get('/patient/me/dossier/pdf', { responseType: 'blob' }),
  getQrCode: () => PATIENT_API.get('/patient/me/qrcode', { responseType: 'blob' }),

  uploadDocument: (formData) => PATIENT_API.post('/patient/me/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: () => PATIENT_API.get('/patient/me/documents'),
  deleteDocument: (id) => PATIENT_API.delete(`/patient/me/documents/${id}`),
  getDocumentFileUrl: (id) => `/api/v1/patient/me/documents/${id}/fichier`,

  getMessages: () => PATIENT_API.get('/patient/me/messages'),
  envoyerMessage: (data) => PATIENT_API.post('/patient/me/messages', data),
  marquerLu: (id) => PATIENT_API.put(`/patient/me/messages/${id}/lu`),

  getRdv: () => PATIENT_API.get('/patient/me/rdv'),
  annulerRdv: (id) => PATIENT_API.put(`/patient/me/rdv/${id}/annuler`),
  creerRdv: (data) => PATIENT_API.post('/patient/me/rdv', data),
  getMedecins: () => PATIENT_API.get('/medecins'),
}

export const medecinApi = {
  getConsultations: () => PATIENT_API.get('/medecin/me/consultations'),
  createConsultation: (data) => PATIENT_API.post('/medecin/me/consultations', data),
  getMyPatients: () => PATIENT_API.get('/medecin/me/patients'),

  // ═══ FEAT 3 — Créneaux bloqués (réutilise endpoints secrétaire) ═══
  getSlots: () => PATIENT_API.get('/secretaire/slots'),
  getSlotsSemaine: (dateDebut) =>
    PATIENT_API.get('/secretaire/slots/semaine', { params: dateDebut ? { dateDebut } : {} }),
  bloquerSlot: (data) => PATIENT_API.post('/secretaire/slots/bloquer', data),
  supprimerSlot: (id) => PATIENT_API.delete(`/secretaire/slots/${id}`),

  // ═══ FEAT 6 — Planning hebdomadaire ═══
  getPlanning: () => PATIENT_API.get('/medecin/me/planning'),

  // ═══ FEAT 7 — Tâches (messages urgents) ═══
  getTaches: () => PATIENT_API.get('/medecin/me/taches'),
}

export const directeurApi = {
  stats: () => PATIENT_API.get('/directeur/stats'),
  patients: (params) => PATIENT_API.get('/directeur/patients', { params }),
  dossier: (id) => PATIENT_API.get(`/directeur/patients/${id}/dossier`),
  exportPdf: (id) => PATIENT_API.get(`/directeur/patients/${id}/dossier/pdf`, { responseType: 'blob' }),
  medecins: () => PATIENT_API.get('/directeur/medecins'),
  rdv: (params) => PATIENT_API.get('/directeur/rdv', { params }),

  // ═══ FEAT 4 — Rapports PDF ═══
  rapportMensuel: (mois, annee) =>
    PATIENT_API.get('/directeur/rapports/mensuel', {
      params: { mois, annee },
      responseType: 'blob',
    }),
  rapportAnnuel: (annee) =>
    PATIENT_API.get('/directeur/rapports/annuel', {
      params: { annee },
      responseType: 'blob',
    }),
  rapportMedecins: () =>
    PATIENT_API.get('/directeur/rapports/medecins', { responseType: 'blob' }),
  rapportPatients: () =>
    PATIENT_API.get('/directeur/rapports/patients', { responseType: 'blob' }),

  // ═══ FEAT 5 — Organigramme ═══
  organigramme: () => PATIENT_API.get('/organigramme'),
}

export const adminApi = {
  createPersonnel: (data) => ADMIN_API.post('/personnel', data),
  listUsers: () => ADMIN_API.get('/users'),
  listByRole: (role) => ADMIN_API.get(`/users/role/${role}`),
  toggleUser: (id) => ADMIN_API.put(`/users/${id}/toggle`),
  deleteUser: (id) => ADMIN_API.delete(`/users/${id}`),
  assignerMedecin: (secretaireId, medecinId) =>
    ADMIN_API.put(`/users/${secretaireId}/assigner-medecin/${medecinId}`),
}

export const secretaireApi = {
  getInfo: () => PATIENT_API.get('/secretaire/info'),
  getSlotsForDoctor: () => PATIENT_API.get('/secretaire/slots'),
  getSlotsSemaine: (dateDebut) =>
    PATIENT_API.get('/secretaire/slots/semaine', { params: dateDebut ? { dateDebut } : {} }),
  bloquerCreneau: (data, doctorName) =>
    PATIENT_API.post('/secretaire/slots/bloquer', data,
      { params: doctorName ? { doctorName } : {} }),
  supprimerCreneau: (id) => PATIENT_API.delete(`/secretaire/slots/${id}`),
}

export const chatbotApi = {
  ask: (question, patientId) =>
    CHATBOT_API.post('/ask', { question, patientId }),
}

// ═══════════════════════════════════════════════════════════════════
// FEAT 1 — Chef de service
// ═══════════════════════════════════════════════════════════════════
export const chefApi = {
  getService:        () => PATIENT_API.get('/chef/service'),
  getMedecins:       () => PATIENT_API.get('/chef/medecins'),
  getStats:          () => PATIENT_API.get('/chef/stats'),
  getCreneaux:       () => PATIENT_API.get('/chef/creneaux'),
  creerCreneau:      (data) => PATIENT_API.post('/chef/creneaux', data),
  supprimerCreneau:  (id) => PATIENT_API.delete(`/chef/creneaux/${id}`),
  // FEAT 6 — Planning du service
  getPlanningService: () => PATIENT_API.get('/chef/planning/service'),
  getPlanningMedecin: (medecinId) =>
    PATIENT_API.get('/chef/planning', { params: { medecinId } }),
}

// ═══════════════════════════════════════════════════════════════════
// FEAT 2 — Messagerie inter-personnel
// ═══════════════════════════════════════════════════════════════════
export const personnelMessagesApi = {
  recus:        () => PATIENT_API.get('/personnel/messages/recus'),
  envoyes:      () => PATIENT_API.get('/personnel/messages/envoyes'),
  envoyer:      (data) => PATIENT_API.post('/personnel/messages', data),
  marquerLu:    (id) => PATIENT_API.put(`/personnel/messages/${id}/lu`),
  countNonLus:  () => PATIENT_API.get('/personnel/messages/non-lus/count'),
  collegues:    () => PATIENT_API.get('/personnel/collegues'),
}

// ═══════════════════════════════════════════════════════════════════
// FEAT 7 — Personnel portal (infirmier, brancardier, aide-soignant)
// ═══════════════════════════════════════════════════════════════════
export const personnelApi = {
  getTaches:        () => PATIENT_API.get('/personnel/me/taches'),
  getPatientsJour:  () => PATIENT_API.get('/personnel/me/patients-jour'),
}
