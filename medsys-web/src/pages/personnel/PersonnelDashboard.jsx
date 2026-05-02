import { useEffect, useState } from 'react'
import { patientApi, medecinApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import LoadingState from '../../components/shared/LoadingState'
import EmptyState from '../../components/shared/EmptyState'
import { useTab } from '../../lib/useTab'
import { Users, Calendar, Stethoscope, FileText, Search, Plus, Eye, X, Activity } from 'lucide-react'
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

  // Consultations state
  const [consultations, setConsultations] = useState([])
  const [consultLoading, setConsultLoading] = useState(false)
  const [showNewConsult, setShowNewConsult] = useState(false)
  const [medecinPatients, setMedecinPatients] = useState([])
  const [consultForm, setConsultForm] = useState({
    patientId: '', motif: '', diagnostic: '', observations: '', traitement: '',
    poids: '', taille: '', tensionSystolique: '', tensionDiastolique: '', temperature: ''
  })

  const isMedecin = user?.role === 'MEDECIN'

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

  // Charger consultations quand on clique sur l'onglet
  useEffect(() => {
    if (tab === 'consultations' && isMedecin) {
      loadConsultations()
    }
  }, [tab])

  const loadConsultations = async () => {
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
  }

  const handleCreateConsultation = async (e) => {
    e.preventDefault()
    try {
      const data = { ...consultForm }
      // Convertir les champs numériques
      if (data.poids) data.poids = parseFloat(data.poids)
      if (data.taille) data.taille = parseFloat(data.taille)
      if (data.tensionSystolique) data.tensionSystolique = parseInt(data.tensionSystolique)
      if (data.tensionDiastolique) data.tensionDiastolique = parseInt(data.tensionDiastolique)
      if (data.temperature) data.temperature = parseFloat(data.temperature)
      // Supprimer les champs vides
      Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === null) delete data[k] })

      await medecinApi.createConsultation(data)
      setShowNewConsult(false)
      setConsultForm({ patientId: '', motif: '', diagnostic: '', observations: '', traitement: '', poids: '', taille: '', tensionSystolique: '', tensionDiastolique: '', temperature: '' })
      loadConsultations()
      alert('Consultation enregistrée avec succès')
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création')
    }
  }

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
      } catch (err) {
        console.error('Erreur recherche:', err)
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
  }
  const subtitles = {
    dashboard: "Vue d'ensemble de votre activité",
    patients: 'Gestion des patients',
    consultations: 'Vos consultations',
    rdv: 'Planning des rendez-vous',
  }

  return (
    <DashboardLayout title={titles[tab]} subtitle={subtitles[tab]}>
      {/* ═══ ONGLET : Tableau de bord ═══ */}
      {tab === 'dashboard' && (
        <>
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
                  <button onClick={() => setTab('consultations')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                    <Stethoscope className="w-5 h-5 text-primary-600" />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">Mes consultations</div>
                      <div className="text-xs text-slate-500">Voir l'historique</div>
                    </div>
                  </button>
                )}
                <button onClick={() => setTab('rdv')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Planning des RDV</div>
                    <div className="text-xs text-slate-500">Voir le calendrier</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ ONGLET : Patients ═══ */}
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

      {/* ═══ ONGLET : Consultations ═══ */}
      {tab === 'consultations' && (
        <div className="space-y-6">
          {/* Bouton nouvelle consultation */}
          {isMedecin && (
            <div className="flex justify-end">
              <button onClick={() => setShowNewConsult(!showNewConsult)} className="btn-primary">
                <Plus className="w-4 h-4" /> Nouvelle consultation
              </button>
            </div>
          )}

          {/* Formulaire nouvelle consultation */}
          {showNewConsult && (
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Nouvelle consultation</h3>
              <form onSubmit={handleCreateConsultation} className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Patient *</label>
                  <select className="input" value={consultForm.patientId}
                    onChange={(e) => setConsultForm({ ...consultForm, patientId: e.target.value })} required>
                    <option value="">— Sélectionner un patient —</option>
                    {/* Patients du médecin + tous les patients */}
                    {(medecinPatients.length > 0 ? medecinPatients : patients).map(p => (
                      <option key={p.id} value={p.id}>{p.prenom || p.nom ? `${p.prenom || ''} ${p.nom || ''}` : `Patient #${p.id}`}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Motif *</label>
                  <input className="input" value={consultForm.motif}
                    onChange={(e) => setConsultForm({ ...consultForm, motif: e.target.value })} required
                    placeholder="Ex: Douleur abdominale, contrôle routine..." />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Diagnostic</label>
                  <textarea className="input min-h-[80px]" value={consultForm.diagnostic}
                    onChange={(e) => setConsultForm({ ...consultForm, diagnostic: e.target.value })}
                    placeholder="Diagnostic établi..." />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Observations</label>
                  <textarea className="input min-h-[80px]" value={consultForm.observations}
                    onChange={(e) => setConsultForm({ ...consultForm, observations: e.target.value })}
                    placeholder="Observations cliniques..." />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Traitement prescrit</label>
                  <textarea className="input min-h-[80px]" value={consultForm.traitement}
                    onChange={(e) => setConsultForm({ ...consultForm, traitement: e.target.value })}
                    placeholder="Traitement et posologie..." />
                </div>

                <h4 className="md:col-span-2 font-semibold text-slate-700 text-sm uppercase tracking-wide mt-2">Constantes vitales</h4>

                <div>
                  <label className="label">Poids (kg)</label>
                  <input type="number" step="0.1" className="input" value={consultForm.poids}
                    onChange={(e) => setConsultForm({ ...consultForm, poids: e.target.value })} placeholder="Ex: 72.5" />
                </div>
                <div>
                  <label className="label">Taille (cm)</label>
                  <input type="number" step="0.1" className="input" value={consultForm.taille}
                    onChange={(e) => setConsultForm({ ...consultForm, taille: e.target.value })} placeholder="Ex: 175" />
                </div>
                <div>
                  <label className="label">Tension systolique (mmHg)</label>
                  <input type="number" className="input" value={consultForm.tensionSystolique}
                    onChange={(e) => setConsultForm({ ...consultForm, tensionSystolique: e.target.value })} placeholder="Ex: 120" />
                </div>
                <div>
                  <label className="label">Tension diastolique (mmHg)</label>
                  <input type="number" className="input" value={consultForm.tensionDiastolique}
                    onChange={(e) => setConsultForm({ ...consultForm, tensionDiastolique: e.target.value })} placeholder="Ex: 80" />
                </div>
                <div>
                  <label className="label">Température (°C)</label>
                  <input type="number" step="0.1" className="input" value={consultForm.temperature}
                    onChange={(e) => setConsultForm({ ...consultForm, temperature: e.target.value })} placeholder="Ex: 37.2" />
                </div>

                <div className="md:col-span-2 flex gap-2 mt-4">
                  <button type="submit" className="btn-primary">Enregistrer la consultation</button>
                  <button type="button" onClick={() => setShowNewConsult(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des consultations */}
          <div className="card">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Historique des consultations</h3>
              <p className="text-sm text-slate-500 mt-0.5">{consultations.length} consultation(s)</p>
            </div>

            {consultLoading ? (
              <div className="p-6"><LoadingState /></div>
            ) : consultations.length === 0 ? (
              <EmptyState icon={Stethoscope} title="Aucune consultation"
                description="Vous n'avez pas encore de consultations enregistrées. Cliquez sur 'Nouvelle consultation' pour en créer une." />
            ) : (
              <div className="divide-y divide-slate-100">
                {consultations.map(c => (
                  <div key={c.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">{c.patientNom || 'Patient'}</div>
                        <div className="text-sm text-slate-500">{formatDateTime(c.dateConsultation)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.temperature && (
                          <span className="badge-neutral text-xs">{c.temperature}°C</span>
                        )}
                        {c.tensionSystolique && c.tensionDiastolique && (
                          <span className="badge-neutral text-xs">{c.tensionSystolique}/{c.tensionDiastolique} mmHg</span>
                        )}
                      </div>
                    </div>
                    {c.motif && (
                      <div className="mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Motif :</span>
                        <span className="text-sm text-slate-700 ml-2">{c.motif}</span>
                      </div>
                    )}
                    {c.diagnostic && (
                      <div className="mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Diagnostic :</span>
                        <span className="text-sm text-slate-700 ml-2">{c.diagnostic}</span>
                      </div>
                    )}
                    {c.traitement && (
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Traitement :</span>
                        <span className="text-sm text-slate-700 ml-2">{c.traitement}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ONGLET : Rendez-vous ═══ */}
      {tab === 'rdv' && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Planning des rendez-vous</h3>
          <EmptyState
            icon={Calendar}
            title="Module RDV"
            description="Les rendez-vous sont gérés par appointment-service. Pour la prise de RDV, voir l'espace patient."
          />
        </div>
      )}

      {/* ═══ MODAL : Détails patient ═══ */}
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
                <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Informations personnelles</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Date de naissance:</span> <span className="font-semibold">{formatDate(selectedPatient.dateNaissance) || '—'}</span></div>
                  <div><span className="text-slate-500">Sexe:</span> <span className="font-semibold">{selectedPatient.sexe || '—'}</span></div>
                  <div><span className="text-slate-500">Téléphone:</span> <span className="font-semibold">{selectedPatient.telephone || '—'}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{selectedPatient.email || '—'}</span></div>
                  <div><span className="text-slate-500">Ville:</span> <span className="font-semibold">{selectedPatient.ville || '—'}</span></div>
                  <div><span className="text-slate-500">Groupe sanguin:</span> <span className="font-semibold">{selectedPatient.groupeSanguin || '—'}</span></div>
                </div>
              </div>

              {dossier && (
                <>
                  {dossier.antecedents?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Antécédents</h4>
                      <ul className="space-y-2 text-sm">
                        {dossier.antecedents.map((a, i) => (
                          <li key={i} className="p-3 bg-slate-50 rounded-lg">
                            <div className="font-semibold">{a.typeAntecedent || a.type || 'Antécédent'}</div>
                            <div className="text-slate-600">{a.description}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dossier.consultations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Consultations ({dossier.consultations.length})</h4>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}