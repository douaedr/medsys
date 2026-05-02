import { useEffect, useState } from 'react'
import { directeurApi } from '../../api/api'
import RapportsPanel from './RapportsPanel'
import OrganigrammeView from '../../components/messages/OrganigrammeView'
import MessagesPanel from '../../components/messages/MessagesPanel'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import LoadingState from '../../components/shared/LoadingState'
import EmptyState from '../../components/shared/EmptyState'
import { useTab } from '../../lib/useTab'
import {
  Users, Calendar, Stethoscope, FileText, Download,
  Eye, Search, ChevronLeft, ChevronRight, X, Activity, TrendingUp
} from 'lucide-react'
import { formatDate, formatDateTime } from '../../lib/utils'

export default function DirecteurDashboard() {
  const [tab, setTab] = useTab('dashboard')
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [medecins, setMedecins] = useState([])
  const [rdv, setRdv] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [dossier, setDossier] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [s, p, m, r] = await Promise.all([
        directeurApi.stats().catch(() => ({ data: null })),
        directeurApi.patients({ page: 0, size: 15, q: '' }).catch(() => ({ data: { content: [], totalPages: 0 } })),
        directeurApi.medecins().catch(() => ({ data: [] })),
        directeurApi.rdv({}).catch(() => ({ data: [] })),
      ])
      setStats(s.data)
      setPatients(p.data?.content || p.data || [])
      setTotalPages(p.data?.totalPages || 0)
      setMedecins(m.data || [])
      setRdv(r.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (tab !== 'patients') return
    const timer = setTimeout(async () => {
      try {
        const res = await directeurApi.patients({ page, size: 15, q: search })
        setPatients(res.data?.content || res.data || [])
        setTotalPages(res.data?.totalPages || 0)
      } catch {}
    }, 300)
    return () => clearTimeout(timer)
  }, [search, page, tab])

  const handleViewDossier = async (patient) => {
    setSelectedPatient(patient)
    try {
      const res = await directeurApi.dossier(patient.id)
      setDossier(res.data)
    } catch { setDossier(null) }
  }

  const handleExportPatientPdf = async (patientId) => {
    setGeneratingPdf(true)
    try {
      const res = await directeurApi.exportPdf(patientId)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `dossier-${patientId}.pdf`; a.click()
    } catch { alert('Erreur lors de la génération du PDF') }
    finally { setGeneratingPdf(false) }
  }

  if (loading) return <DashboardLayout title="Direction"><LoadingState /></DashboardLayout>

  const titles = {
    dashboard:    'Tableau de bord',
    stats:        'Statistiques',
    patients:     'Patients',
    medecins:     'Médecins',
    rapports:     'Rapports PDF',
    organigramme: 'Organigramme',
    messages:     'Messagerie',
  }

  return (
    <DashboardLayout title={titles[tab]} subtitle="Direction — MedSys">

      {/* ═══ DASHBOARD ═══ */}
      {tab === 'dashboard' && (<>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Patients" value={stats?.totalPatients ?? patients.length} color="primary" />
          <StatCard icon={Calendar} label="RDV total" value={stats?.totalRdv ?? rdv.length} color="accent" />
          <StatCard icon={Stethoscope} label="Médecins" value={stats?.totalMedecins ?? medecins.length} color="success" />
          <StatCard icon={Activity} label="Consultations" value={stats?.totalConsultations ?? 0} color="warning" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Patients récents</h3>
            {patients.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-2" onClick={() => handleViewDossier(p)}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                  {(p.prenom?.[0] || '') + (p.nom?.[0] || '')}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">{p.prenom} {p.nom}</div>
                  <div className="text-xs text-slate-500">{p.email || '—'}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Accès rapides</h3>
            <div className="space-y-2">
              <button onClick={() => setTab('patients')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-600" />
                <div><div className="font-semibold text-sm">Voir les patients</div><div className="text-xs text-slate-500">{patients.length} enregistrés</div></div>
              </button>
              <button onClick={() => setTab('medecins')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-primary-600" />
                <div><div className="font-semibold text-sm">Voir les médecins</div><div className="text-xs text-slate-500">{medecins.length} médecins</div></div>
              </button>
              <button onClick={() => setTab('rapports')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-600" />
                <div><div className="font-semibold text-sm">Rapports PDF</div><div className="text-xs text-slate-500">Générer des rapports</div></div>
              </button>
              <button onClick={() => setTab('organigramme')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-600" />
                <div><div className="font-semibold text-sm">Organigramme</div><div className="text-xs text-slate-500">Hiérarchie du personnel</div></div>
              </button>
              <button onClick={() => setTab('messages')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-600" />
                <div><div className="font-semibold text-sm">Messagerie</div><div className="text-xs text-slate-500">Messages inter-personnel</div></div>
              </button>
            </div>
          </div>
        </div>
      </>)}

      {/* ═══ STATS ═══ */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Patients total" value={stats?.totalPatients ?? 0} color="primary" />
            <StatCard icon={Calendar} label="RDV total" value={stats?.totalRdv ?? 0} color="accent" />
            <StatCard icon={TrendingUp} label="RDV aujourd'hui" value={stats?.rdvAujourdhui ?? 0} color="success" />
            <StatCard icon={Stethoscope} label="Médecins actifs" value={stats?.totalMedecins ?? 0} color="warning" />
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Derniers rendez-vous</h3>
            {rdv.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">Aucun rendez-vous</p> : (
              <div className="space-y-2">
                {rdv.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-semibold">{r.medecinNom || r.doctorName || 'Médecin'}</div>
                      <div className="text-xs text-slate-500">{formatDateTime(r.date)} {r.heure ? `à ${r.heure}` : ''}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.statut === 'ANNULE' ? 'bg-red-100 text-red-700' : r.statut === 'TERMINE' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {r.statut || 'EN_ATTENTE'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ PATIENTS ═══ */}
      {tab === 'patients' && (
        <div className="card">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-slate-900">Liste des patients</h3>
              <p className="text-sm text-slate-500 mt-0.5">{patients.length} patient(s)</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
                placeholder="Rechercher…" className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 w-64" />
            </div>
          </div>
          {patients.length === 0 ? <EmptyState icon={Users} title="Aucun patient" description="Aucun résultat." /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Date naissance</th>
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
                            <div className="font-semibold text-sm">{p.prenom} {p.nom}</div>
                            <div className="text-xs text-slate-500">CIN: {p.cin || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(p.dateNaissance)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.email || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleViewDossier(p)} className="btn-ghost btn-sm" title="Dossier"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleExportPatientPdf(p.id)} className="btn-ghost btn-sm" title="PDF" disabled={generatingPdf}><Download className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost btn-sm"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-slate-600">Page {page + 1}/{totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-ghost btn-sm"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* ═══ MEDECINS ═══ */}
      {tab === 'medecins' && (
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Médecins</h3>
            <p className="text-sm text-slate-500 mt-0.5">{medecins.length} médecin(s)</p>
          </div>
          {medecins.length === 0 ? <EmptyState icon={Stethoscope} title="Aucun médecin" description="Aucun médecin enregistré." /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-6 py-3">Médecin</th>
                    <th className="px-6 py-3">Spécialité</th>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Matricule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medecins.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                          </div>
                          <div className="font-semibold text-sm">Dr. {m.prenom} {m.nom}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.specialite || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.service || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.matricule || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ RAPPORTS PDF (FEAT 4) ═══ */}
      {tab === 'rapports' && <RapportsPanel />}

      {/* ═══ ORGANIGRAMME (FEAT 5) ═══ */}
      {tab === 'organigramme' && <OrganigrammeView />}

      {/* ═══ MESSAGERIE (FEAT 2) ═══ */}
      {tab === 'messages' && <MessagesPanel />}

      {/* ═══ MODAL: Dossier patient ═══ */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setSelectedPatient(null); setDossier(null) }}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-lg">{selectedPatient.prenom} {selectedPatient.nom}</h3>
                <p className="text-sm text-slate-500">CIN: {selectedPatient.cin || '—'} · ID #{selectedPatient.id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExportPatientPdf(selectedPatient.id)} className="btn-outline btn-sm" disabled={generatingPdf}><Download className="w-4 h-4" /> PDF</button>
                <button onClick={() => { setSelectedPatient(null); setDossier(null) }} className="btn-ghost"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Informations</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Naissance:</span> <span className="font-semibold">{formatDate(selectedPatient.dateNaissance) || '—'}</span></div>
                  <div><span className="text-slate-500">Sexe:</span> <span className="font-semibold">{selectedPatient.sexe || '—'}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{selectedPatient.email || '—'}</span></div>
                  <div><span className="text-slate-500">Groupe sanguin:</span> <span className="font-semibold">{selectedPatient.groupeSanguin || '—'}</span></div>
                </div>
              </div>
              {dossier?.antecedents?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Antécédents</h4>
                  <ul className="space-y-2 text-sm">
                    {dossier.antecedents.map((a, i) => (
                      <li key={i} className="p-3 bg-slate-50 rounded-lg">
                        <div className="font-semibold">{a.typeAntecedent || a.type}</div>
                        <div className="text-slate-600">{a.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dossier?.consultations?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Consultations ({dossier.consultations.length})</h4>
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