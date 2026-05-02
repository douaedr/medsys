import { useEffect, useState } from 'react'
import { patientApi, medecinApi, secretaireApi, personnelApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import LoadingState from '../../components/shared/LoadingState'
import EmptyState from '../../components/shared/EmptyState'
import PlanningHebdo from '../../components/planning/PlanningHebdo'
import MessagesPanel from '../../components/messages/MessagesPanel'
import { useTab } from '../../lib/useTab'
import {
  Users, Calendar, Stethoscope, FileText, Search, Plus, Eye, X, Activity,
  Clock, ClipboardList, MessageSquare, AlertCircle, Heart
} from 'lucide-react'
import { formatDate, formatDateTime } from '../../lib/utils'

export default function PersonnelDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useTab('dashboard')
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [dossier, setDossier] = useState(null)
  const [form, setForm] = useState({
    nom: '', prenom: '', cin: '', dateNaissance: '', sexe: 'MASCULIN',
    telephone: '', email: '', adresse: '', ville: '', groupeSanguin: ''
  })

  // Consultations
  const [consultations, setConsultations] = useState([])
  const [consultLoading, setConsultLoading] = useState(false)
  const [showNewConsult, setShowNewConsult] = useState(false)
  const [medecinPatients, setMedecinPatients] = useState([])
  const [consultForm, setConsultForm] = useState({
    patientId: '', motif: '', diagnostic: '', observations: '', traitement: '',
    poids: '', taille: '', tensionSystolique: '', tensionDiastolique: '', temperature: ''
  })

  // FEAT 6 — Planning hebdomadaire
  const [planning, setPlanning] = useState([])
  // FEAT 3 — Créneaux bloqués
  const [blockedSlots, setBlockedSlots] = useState([])
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockForm, setBlockForm] = useState({ date: '', heureDebut: '08:00', heureFin: '12:00', raison: '' })

  // FEAT 7 — Tâches
  const [taches, setTaches] = useState([])

  const isMedecin = user?.role === 'MEDECIN'
  const isPersonnel = user?.role === 'PERSONNEL'

  const loadAll = async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([
        patientApi.getAll({ page: 0, size: 50 }).catch(() => ({ data: { content: [] } })),
        patientApi.stats().catch(() => ({ data: null })),
      ])
      setPatients(p.data?.content || p.data || [])
      setStats(s.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadAll() }, [])

  // Consultations
  useEffect(() => {
    if (tab === 'consultations' && isMedecin) {
      (async () => {
        setConsultLoading(true)
        try {
          const [cRes, pRes] = await Promise.all([
            medecinApi.getConsultations().catch(() => ({ data: [] })),
            medecinApi.getMyPatients().catch(() => ({ data: [] })),
          ])
          setConsultations(cRes.data || [])
          setMedecinPatients(pRes.data || [])
        } finally {
          setConsultLoading(false)
        }
      })()
    }
  }, [tab])

  // FEAT 3 + 6 — Charger planning et créneaux bloqués
  useEffect(() => {
    if (tab === 'planning' && isMedecin) {
      (async () => {
        const [pl, bl] = await Promise.all([
          medecinApi.getPlanning().catch(() => ({ data: [] })),
          medecinApi.getSlots().catch(() => ({ data: [] })),
        ])
        setPlanning(pl.data || [])
        setBlockedSlots(bl.data || [])
      })()
    }
  }, [tab])

  // FEAT 7 — Charger tâches
  useEffect(() => {
    if (tab === 'taches') {
      (async () => {
        try {
          const res = isPersonnel
            ? await personnelApi.getTaches()
            : await medecinApi.getTaches()
          setTaches(res.data || [])
        } catch {}
      })()
    }
  }, [tab])

  const handleCreateConsultation = async (e) => {
    e.preventDefault()
    try {
      const data = { ...consultForm }
      if (data.poids) data.poids = parseFloat(data.poids)
      if (data.taille) data.taille = parseFloat(data.taille)
      if (data.tensionSystolique) data.tensionSystolique = parseInt(data.tensionSystolique)
      if (data.tensionDiastolique) data.tensionDiastolique = parseInt(data.tensionDiastolique)
      if (data.temperature) data.temperature = parseFloat(data.temperature)
      Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === null) delete data[k] })
      await medecinApi.createConsultation(data)
      setShowNewConsult(false)
      setConsultForm({ patientId: '', motif: '', diagnostic: '', observations: '', traitement: '', poids: '', taille: '', tensionSystolique: '', tensionDiastolique: '', temperature: '' })
      const cRes = await medecinApi.getConsultations()
      setConsultations(cRes.data || [])
      alert('Consultation enregistrée avec succès')
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleBlockSlot = async (e) => {
    e.preventDefault()
    try {
      await medecinApi.bloquerSlot({
        slotDate: blockForm.date,
        heureDebut: blockForm.heureDebut + ':00',
        heureFin: blockForm.heureFin + ':00',
        raison: blockForm.raison,
      })
      setShowBlockForm(false)
      setBlockForm({ date: '', heureDebut: '08:00', heureFin: '12:00', raison: '' })
      const bl = await medecinApi.getSlots()
      setBlockedSlots(bl.data || [])
      alert('Créneau bloqué')
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Erreur lors du blocage')
    }
  }

  const handleUnblock = async (id) => {
    if (!confirm('Débloquer ce créneau ?')) return
    try {
      await medecinApi.supprimerSlot(id)
      const bl = await medecinApi.getSlots()
      setBlockedSlots(bl.data || [])
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  // === Recherche patients ===
  useEffect(() => {
    if (!search) {
      if (patients.length === 0 || patients.length > 50) loadAll()
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await patientApi.search(search, { page: 0, size: 50 })
        setPatients(res.data?.content || res.data || [])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleCreatePatient = async (e) => {
    e.preventDefault()
    try {
      await patientApi.create(form)
      setShowCreate(false)
      setForm({ nom: '', prenom: '', cin: '', dateNaissance: '', sexe: 'MASCULIN', telephone: '', email: '', adresse: '', ville: '', groupeSanguin: '' })
      loadAll()
      alert('Patient créé avec succès')
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    try {
      const res = await patientApi.dossier(patient.id)
      setDossier(res.data)
    } catch (err) {
      setDossier(null)
    }
  }

  const handleDeletePatient = async (p) => {
    if (confirm(`Supprimer le patient ${p.prenom} ${p.nom} ?`)) {
      try {
        await patientApi.delete(p.id)
        loadAll()
      } catch (err) {
        alert('Erreur lors de la suppression')
      }
    }
  }

  if (loading) return <DashboardLayout title="Tableau de bord"><LoadingState /></DashboardLayout>

  const titles = {
    dashboard: 'Tableau de bord',
    patients: 'Patients',
    consultations: 'Consultations',
    rdv: 'Rendez-vous',
    planning: 'Mon planning',
    messages: 'Messagerie',
    taches: 'Mes tâches',
  }
  const subtitles = {
    dashboard: "Vue d'ensemble de votre activité",
    patients: 'Gestion des patients',
    consultations: 'Vos consultations',
    rdv: 'Planning des rendez-vous',
    planning: 'Emploi du temps hebdomadaire et créneaux bloqués',
    messages: 'Messagerie inter-personnel',
    taches: 'Tâches urgentes assignées',
  }

  return (
    <DashboardLayout title={titles[tab]} subtitle={subtitles[tab]}>
      {/* ═══ Tableau de bord ═══ */}
      {tab === 'dashboard' && (
        <>
          {/* FEAT 7 — Bandeau tâches urgentes pour personnel */}
          {isPersonnel && taches.length > 0 && (
            <div className="card p-4 mb-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Tâches urgentes ({taches.length})</h3>
              </div>
              <div className="space-y-2">
                {taches.slice(0, 3).map(t => (
                  <div key={t.id} className="text-sm text-red-900">
                    <span className="font-semibold">{t.expediteurNom}:</span> {t.contenu}
                  </div>
                ))}
              </div>
              <button onClick={() => setTab('taches')} className="text-xs text-red-600 underline mt-2">Voir toutes les tâches →</button>
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="Patients total" value={stats?.total || patients.length} color="primary" />
            <StatCard icon={Calendar} label="RDV aujourd'hui" value={stats?.rdvToday || 0} color="accent" />
            <StatCard icon={Stethoscope} label="Consultations" value={consultations.length || stats?.consultations || 0} color="success" />
            <StatCard icon={FileText} label="Dossiers actifs" value={stats?.dossiers || patients.length} color="warning" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Patients récents</h3>
              {patients.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                    {(p.prenom?.[0] || '') + (p.nom?.[0] || '')}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{p.prenom} {p.nom}</div>
                    <div className="text-xs text-slate-500">{p.email || p.telephone || '—'}</div>
                  </div>
                </div>
              ))}
              {patients.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun patient</p>}
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button onClick={() => setTab('patients')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                  <Users className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Voir tous les patients</div>
                    <div className="text-xs text-slate-500">{patients.length} patient(s) enregistré(s)</div>
                  </div>
                </button>
                {isMedecin && (
                  <>
                    <button onClick={() => setTab('consultations')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                      <Stethoscope className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Mes consultations</div>
                        <div className="text-xs text-slate-500">Voir l'historique</div>
                      </div>
                    </button>
                    <button onClick={() => setTab('planning')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Mon planning</div>
                        <div className="text-xs text-slate-500">Emploi du temps + créneaux bloqués</div>
                      </div>
                    </button>
                  </>
                )}
                <button onClick={() => setTab('messages')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Messagerie</div>
                    <div className="text-xs text-slate-500">Communiquer avec l'équipe</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ Patients ═══ (inchangé par rapport à votre version) */}
      {tab === 'patients' && (
        <div className="card">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-slate-900">Liste des patients</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {patients.length} patient(s) {search && `· recherche: "${search}"`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher (nom, prénom, CIN)…"
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:bg-white w-72"
                />
                {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary-600">…</span>}
              </div>
              <button onClick={() => setShowCreate(!showCreate)} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" /> Nouveau patient
              </button>
            </div>
          </div>

          {showCreate && (
            <form onSubmit={handleCreatePatient} className="p-6 bg-slate-50 border-b border-slate-100 grid md:grid-cols-2 gap-4">
              <div><label className="label">Prénom *</label>
                <input className="input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></div>
              <div><label className="label">Nom *</label>
                <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
              <div><label className="label">CIN *</label>
                <input className="input" value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} required /></div>
              <div><label className="label">Date de naissance *</label>
                <input type="date" className="input" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} required /></div>
              <div><label className="label">Sexe</label>
                <select className="input" value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                  <option value="MASCULIN">Masculin</option>
                  <option value="FEMININ">Féminin</option>
                </select></div>
              <div><label className="label">Téléphone</label>
                <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
              <div><label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Ville</label>
                <input className="input" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Adresse</label>
                <input className="input" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
              <div><label className="label">Groupe sanguin</label>
                <select className="input" value={form.groupeSanguin} onChange={(e) => setForm({ ...form, groupeSanguin: e.target.value })}>
                  <option value="">—</option>
                  <option value="A_POSITIF">A+</option><option value="A_NEGATIF">A-</option>
                  <option value="B_POSITIF">B+</option><option value="B_NEGATIF">B-</option>
                  <option value="AB_POSITIF">AB+</option><option value="AB_NEGATIF">AB-</option>
                  <option value="O_POSITIF">O+</option><option value="O_NEGATIF">O-</option>
                </select></div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-primary">Créer le patient</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Annuler</button>
              </div>
            </form>
          )}

          {patients.length === 0 ? (
            <EmptyState icon={Users} title="Aucun patient" description={search ? "Aucun résultat pour cette recherche." : "Aucun patient enregistré pour le moment."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Date naissance</th>
                    <th className="px-6 py-3">Téléphone</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                            {(p.prenom?.[0] || '') + (p.nom?.[0] || '')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{p.prenom} {p.nom}</div>
                            <div className="text-xs text-slate-500">CIN: {p.cin || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(p.dateNaissance)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.telephone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.email || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleViewPatient(p)} className="btn-ghost btn-sm" title="Voir le dossier">
                          <Eye className="w-4 h-4" />
                        </button>
                        {isMedecin && (
                          <button onClick={() => handleDeletePatient(p)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50" title="Supprimer">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ Consultations ═══ (inchangé) */}
      {tab === 'consultations' && (
        <div className="space-y-6">
          {isMedecin && (
            <div className="flex justify-end">
              <button onClick={() => setShowNewConsult(!showNewConsult)} className="btn-primary">
                <Plus className="w-4 h-4" /> Nouvelle consultation
              </button>
            </div>
          )}
          {showNewConsult && (
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Nouvelle consultation</h3>
              <form onSubmit={handleCreateConsultation} className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Patient *</label>
                  <select className="input" value={consultForm.patientId}
                    onChange={(e) => setConsultForm({ ...consultForm, patientId: e.target.value })} required>
                    <option value="">— Sélectionner un patient —</option>
                    {(medecinPatients.length > 0 ? medecinPatients : patients).map(p => (
                      <option key={p.id} value={p.id}>{p.prenom || p.nom ? `${p.prenom || ''} ${p.nom || ''}` : `Patient #${p.id}`}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Motif *</label>
                  <input className="input" value={consultForm.motif}
                    onChange={(e) => setConsultForm({ ...consultForm, motif: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Diagnostic</label>
                  <textarea className="input min-h-[80px]" value={consultForm.diagnostic}
                    onChange={(e) => setConsultForm({ ...consultForm, diagnostic: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Observations</label>
                  <textarea className="input min-h-[80px]" value={consultForm.observations}
                    onChange={(e) => setConsultForm({ ...consultForm, observations: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Traitement prescrit</label>
                  <textarea className="input min-h-[80px]" value={consultForm.traitement}
                    onChange={(e) => setConsultForm({ ...consultForm, traitement: e.target.value })} />
                </div>
                <h4 className="md:col-span-2 font-semibold text-slate-700 text-sm uppercase tracking-wide mt-2">Constantes</h4>
                <div><label className="label">Poids (kg)</label>
                  <input type="number" step="0.1" className="input" value={consultForm.poids} onChange={(e) => setConsultForm({ ...consultForm, poids: e.target.value })} /></div>
                <div><label className="label">Taille (cm)</label>
                  <input type="number" step="0.1" className="input" value={consultForm.taille} onChange={(e) => setConsultForm({ ...consultForm, taille: e.target.value })} /></div>
                <div><label className="label">Tension systolique</label>
                  <input type="number" className="input" value={consultForm.tensionSystolique} onChange={(e) => setConsultForm({ ...consultForm, tensionSystolique: e.target.value })} /></div>
                <div><label className="label">Tension diastolique</label>
                  <input type="number" className="input" value={consultForm.tensionDiastolique} onChange={(e) => setConsultForm({ ...consultForm, tensionDiastolique: e.target.value })} /></div>
                <div><label className="label">Température (°C)</label>
                  <input type="number" step="0.1" className="input" value={consultForm.temperature} onChange={(e) => setConsultForm({ ...consultForm, temperature: e.target.value })} /></div>
                <div className="md:col-span-2 flex gap-2 mt-4">
                  <button type="submit" className="btn-primary">Enregistrer</button>
                  <button type="button" onClick={() => setShowNewConsult(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            </div>
          )}
          <div className="card">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Historique des consultations</h3>
              <p className="text-sm text-slate-500 mt-0.5">{consultations.length} consultation(s)</p>
            </div>
            {consultLoading ? <div className="p-6"><LoadingState /></div>
              : consultations.length === 0 ? <EmptyState icon={Stethoscope} title="Aucune consultation" description="Aucune consultation enregistrée." />
              : <div className="divide-y divide-slate-100">
                  {consultations.map(c => (
                    <div key={c.id} className="p-6 hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-slate-900">{c.patientNom || 'Patient'}</div>
                          <div className="text-sm text-slate-500">{formatDateTime(c.dateConsultation)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.temperature && <span className="badge-neutral text-xs">{c.temperature}°C</span>}
                          {c.tensionSystolique && c.tensionDiastolique && (
                            <span className="badge-neutral text-xs">{c.tensionSystolique}/{c.tensionDiastolique} mmHg</span>
                          )}
                        </div>
                      </div>
                      {c.motif && <div className="mb-1"><span className="text-xs font-semibold text-slate-500 uppercase">Motif :</span> <span className="text-sm text-slate-700 ml-2">{c.motif}</span></div>}
                      {c.diagnostic && <div className="mb-1"><span className="text-xs font-semibold text-slate-500 uppercase">Diagnostic :</span> <span className="text-sm text-slate-700 ml-2">{c.diagnostic}</span></div>}
                      {c.traitement && <div><span className="text-xs font-semibold text-slate-500 uppercase">Traitement :</span> <span className="text-sm text-slate-700 ml-2">{c.traitement}</span></div>}
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* ═══ FEAT 6 — Mon planning + FEAT 3 — Créneaux bloqués ═══ */}
      {tab === 'planning' && isMedecin && (
        <div className="space-y-6">
          {/* Planning hebdomadaire (lecture seule) */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Emploi du temps hebdomadaire</h3>
            {planning.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Aucun créneau attribué"
                description="Votre chef de service n'a pas encore attribué de créneaux récurrents. Le planning hebdomadaire apparaîtra ici."
              />
            ) : (
              <PlanningHebdo creneaux={planning} />
            )}
          </div>

          {/* FEAT 3 — Créneaux bloqués datés */}
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Créneaux bloqués</h3>
                <p className="text-sm text-slate-500 mt-0.5">{blockedSlots.length} créneau(x) bloqué(s)</p>
              </div>
              <button onClick={() => setShowBlockForm(!showBlockForm)} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" /> Bloquer un créneau
              </button>
            </div>
            {showBlockForm && (
              <form onSubmit={handleBlockSlot} className="p-6 bg-slate-50 border-b border-slate-100 grid md:grid-cols-2 gap-4">
                <div><label className="label">Date *</label>
                  <input type="date" className="input" value={blockForm.date} onChange={e => setBlockForm({ ...blockForm, date: e.target.value })} required /></div>
                <div><label className="label">Raison</label>
                  <input className="input" value={blockForm.raison} onChange={e => setBlockForm({ ...blockForm, raison: e.target.value })} placeholder="Ex: congés, formation..." /></div>
                <div><label className="label">Heure début *</label>
                  <input type="time" className="input" value={blockForm.heureDebut} onChange={e => setBlockForm({ ...blockForm, heureDebut: e.target.value })} required /></div>
                <div><label className="label">Heure fin *</label>
                  <input type="time" className="input" value={blockForm.heureFin} onChange={e => setBlockForm({ ...blockForm, heureFin: e.target.value })} required /></div>
                <div className="md:col-span-2 flex gap-2">
                  <button type="submit" className="btn-primary">Bloquer</button>
                  <button type="button" onClick={() => setShowBlockForm(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            )}
            {blockedSlots.length === 0 ? (
              <EmptyState icon={Clock} title="Aucun créneau bloqué" description="Bloquez un créneau pour empêcher la prise de RDV sur cette plage." />
            ) : (
              <div className="divide-y divide-slate-100">
                {blockedSlots.map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{formatDate(s.slotDate || s.date)}</div>
                      <div className="text-xs text-slate-500">
                        {(s.heureDebut || '').substring(0,5)} – {(s.heureFin || '').substring(0,5)}
                        {s.raison && <span className="ml-2 italic">· {s.raison}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleUnblock(s.id)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ FEAT 2 — Messages ═══ */}
      {tab === 'messages' && <MessagesPanel />}

      {/* ═══ FEAT 7 — Tâches (PERSONNEL ou MEDECIN) ═══ */}
      {tab === 'taches' && (
        <div className="space-y-4">
          <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Mes tâches assignées</h3>
                <p className="text-xs text-slate-600">Messages urgents reçus, à traiter en priorité</p>
              </div>
            </div>
          </div>

          {taches.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Aucune tâche urgente" description="Vous n'avez pas de tâche urgente en attente." />
          ) : (
            <div className="card divide-y divide-slate-100">
              {taches.map(t => (
                <div key={t.id} className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">
                      {t.expediteurNom || 'Anonyme'}
                      <span className="text-[10px] uppercase ml-2 text-slate-400">{t.expediteurRole}</span>
                    </div>
                    <div className="text-sm text-slate-700 mt-1">{t.contenu}</div>
                    <div className="text-xs text-slate-400 mt-1">{formatDateTime(t.dateEnvoi)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Rendez-vous ═══ */}
      {tab === 'rdv' && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Planning des rendez-vous</h3>
          <EmptyState icon={Calendar} title="Module RDV" description="Les rendez-vous sont gérés par appointment-service." />
        </div>
      )}

      {/* ═══ Modal patient ═══ (inchangé) */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setSelectedPatient(null); setDossier(null) }}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedPatient.prenom} {selectedPatient.nom}</h3>
                <p className="text-sm text-slate-500">CIN: {selectedPatient.cin || '—'} · ID #{selectedPatient.id}</p>
              </div>
              <button onClick={() => { setSelectedPatient(null); setDossier(null) }} className="btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Informations</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Naissance:</span> <span className="font-semibold">{formatDate(selectedPatient.dateNaissance) || '—'}</span></div>
                  <div><span className="text-slate-500">Sexe:</span> <span className="font-semibold">{selectedPatient.sexe || '—'}</span></div>
                  <div><span className="text-slate-500">Téléphone:</span> <span className="font-semibold">{selectedPatient.telephone || '—'}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{selectedPatient.email || '—'}</span></div>
                </div>
              </div>
              {dossier?.consultations?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Consultations</h4>
                  <ul className="space-y-2 text-sm">
                    {dossier.consultations.slice(0, 5).map((c, i) => (
                      <li key={i} className="p-3 bg-slate-50 rounded-lg">
                        <div className="font-semibold">{formatDateTime(c.dateConsultation || c.date)}</div>
                        <div className="text-slate-600">{c.motif || c.diagnostic || 'Consultation'}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
