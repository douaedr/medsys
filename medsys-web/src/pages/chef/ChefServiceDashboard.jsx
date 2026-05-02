import { useEffect, useState } from 'react'
import { chefApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import LoadingState from '../../components/shared/LoadingState'
import EmptyState from '../../components/shared/EmptyState'
import PlanningHebdo from '../../components/planning/PlanningHebdo'
import MessagesPanel from '../../components/messages/MessagesPanel'
import OrganigrammeView from '../../components/messages/OrganigrammeView'
import { useTab } from '../../lib/useTab'
import {
  Users, Calendar, Stethoscope, Clock, BarChart3, Plus, X, Crown,
  Network, MessageSquare, Activity, Bed
} from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'CONTROLE', label: 'Contrôle' },
  { value: 'OPERATION', label: 'Opération' },
  { value: 'URGENCE', label: 'Urgence' },
  { value: 'ADMINISTRATIF', label: 'Administratif' },
]

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']

export default function ChefServiceDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useTab('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [service, setService] = useState(null)
  const [medecins, setMedecins] = useState([])
  const [creneaux, setCreneaux] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    medecinId: '',
    jour: 'LUNDI',
    heureDebut: '08:00',
    heureFin: '12:00',
    type: 'CONSULTATION',
    notes: '',
  })

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, m, st, c] = await Promise.all([
        chefApi.getService().catch(() => ({ data: null })),
        chefApi.getMedecins().catch(() => ({ data: [] })),
        chefApi.getStats().catch(() => ({ data: null })),
        chefApi.getCreneaux().catch(() => ({ data: [] })),
      ])
      setService(s.data)
      setMedecins(m.data || [])
      setStats(st.data)
      setCreneaux(c.data || [])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadAll() }, [])

  const handleAddSlotFromGrid = (jour, heure) => {
    setForm({ ...form, jour, heureDebut: heure, heureFin: addHour(heure) })
    setShowCreate(true)
  }
  const addHour = (h) => {
    const [hh, mm] = h.split(':').map(Number)
    return `${String(Math.min(hh + 1, 23)).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  const handleCreateCreneau = async (e) => {
    e.preventDefault()
    if (!form.medecinId) return alert('Sélectionnez un médecin')
    try {
      await chefApi.creerCreneau({
        medecinId: parseInt(form.medecinId),
        jour: form.jour,
        heureDebut: form.heureDebut + ':00',
        heureFin: form.heureFin + ':00',
        type: form.type,
        notes: form.notes,
      })
      setShowCreate(false)
      setForm({ medecinId: '', jour: 'LUNDI', heureDebut: '08:00', heureFin: '12:00', type: 'CONSULTATION', notes: '' })
      loadAll()
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création')
    }
  }

  const handleDeleteCreneau = async (id) => {
    if (!confirm('Supprimer ce créneau ?')) return
    try {
      await chefApi.supprimerCreneau(id)
      loadAll()
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <DashboardLayout title="Chef de service"><LoadingState /></DashboardLayout>

  const titles = {
    dashboard: service ? `Service ${service.nom}` : 'Tableau de bord',
    medecins: 'Médecins du service',
    creneaux: 'Créneaux & planning hebdomadaire',
    stats: 'Statistiques du service',
    organigramme: 'Organigramme',
    messages: 'Messagerie',
  }
  const subtitles = {
    dashboard: 'Vue d\'ensemble de votre service',
    medecins: 'Liste et gestion de l\'équipe médicale',
    creneaux: 'Attribuer des créneaux récurrents aux médecins',
    stats: 'Activité et indicateurs',
    organigramme: 'Hiérarchie de l\'établissement',
    messages: 'Messagerie inter-personnel',
  }

  return (
    <DashboardLayout title={titles[tab]} subtitle={subtitles[tab]}>
      {/* ═══ Onglet : Dashboard ═══ */}
      {tab === 'dashboard' && (
        <>
          {!service && (
            <EmptyState
              icon={Crown}
              title="Aucun service attribué"
              description="Votre compte n'est pas encore rattaché à un service. Contactez l'administrateur."
            />
          )}
          {service && (
            <>
              {/* Carte service */}
              <div className="card p-6 mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-amber-700 tracking-wider">Chef de service</div>
                      <h2 className="font-bold text-slate-900 text-lg">{service.nom}</h2>
                      <p className="text-xs text-slate-600">
                        {service.code && <span className="font-mono mr-2">{service.code}</span>}
                        {service.localisation || 'Localisation non renseignée'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Vous êtes connecté en tant que</div>
                    <div className="font-bold text-slate-900">Dr. {user?.prenom} {user?.nom}</div>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Stethoscope} label="Médecins" value={stats?.nombreMedecins || medecins.length} color="primary" />
                <StatCard icon={Clock} label="Créneaux actifs" value={stats?.nombreCreneauxActifs || creneaux.length} color="accent" />
                <StatCard icon={Calendar} label="RDV aujourd'hui" value={stats?.nombreRdvAujourdhui || 0} color="success" />
                <StatCard icon={Bed} label="Capacité lits" value={stats?.capaciteLits || 0} color="warning" />
              </div>

              {/* Actions rapides */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Médecins de l'équipe</h3>
                  {medecins.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                        {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                          Dr. {m.prenom} {m.nom}
                          {m.estChef && <Crown className="w-3 h-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-slate-500">{m.specialite || '—'}</div>
                      </div>
                    </div>
                  ))}
                  {medecins.length > 5 && (
                    <button onClick={() => setTab('medecins')} className="w-full mt-3 text-sm text-primary-600 hover:underline">
                      Voir les {medecins.length} médecins →
                    </button>
                  )}
                  {medecins.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun médecin dans ce service</p>}
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Actions rapides</h3>
                  <div className="space-y-2">
                    <button onClick={() => setTab('creneaux')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Gérer les créneaux</div>
                        <div className="text-xs text-slate-500">{creneaux.length} créneau(x) actif(s)</div>
                      </div>
                    </button>
                    <button onClick={() => setTab('stats')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Voir les statistiques</div>
                        <div className="text-xs text-slate-500">Activité du service</div>
                      </div>
                    </button>
                    <button onClick={() => setTab('messages')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                      <MessageSquare className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Messagerie</div>
                        <div className="text-xs text-slate-500">Communiquer avec le personnel</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ Onglet : Médecins ═══ */}
      {tab === 'medecins' && (
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Médecins du service</h3>
            <p className="text-sm text-slate-500 mt-0.5">{medecins.length} médecin(s)</p>
          </div>
          {medecins.length === 0 ? (
            <EmptyState icon={Stethoscope} title="Aucun médecin" description="Aucun médecin n'est rattaché à ce service." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Médecin</th>
                    <th className="px-6 py-3">Matricule</th>
                    <th className="px-6 py-3">Spécialité</th>
                    <th className="px-6 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medecins.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                            {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">Dr. {m.prenom} {m.nom}</div>
                            <div className="text-xs text-slate-500">ID #{m.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{m.matricule || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.specialite || '—'}</td>
                      <td className="px-6 py-4">
                        {m.estChef ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">
                            <Crown className="w-3 h-3" /> Chef
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            Médecin
                          </span>
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

      {/* ═══ Onglet : Créneaux & planning ═══ */}
      {tab === 'creneaux' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-slate-600">
                {creneaux.length} créneau(x) attribué(s) sur le service. Cliquez sur une case vide pour ajouter,
                ou utilisez le bouton ci-contre.
              </p>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
              <Plus className="w-4 h-4" /> Attribuer un créneau
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateCreneau} className="card p-6 grid md:grid-cols-2 gap-4">
              <h3 className="md:col-span-2 font-bold text-slate-900">Nouveau créneau</h3>
              <div>
                <label className="label">Médecin *</label>
                <select className="input" value={form.medecinId} onChange={e => setForm({ ...form, medecinId: e.target.value })} required>
                  <option value="">— Sélectionner —</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Jour *</label>
                <select className="input" value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })}>
                  {JOURS.map(j => <option key={j} value={j}>{j.charAt(0) + j.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Heure début *</label>
                <input type="time" className="input" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })} required />
              </div>
              <div>
                <label className="label">Heure fin *</label>
                <input type="time" className="input" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })} required />
              </div>
              <div>
                <label className="label">Type d'activité *</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optionnel" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-primary">Attribuer le créneau</button>
                <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Annuler</button>
              </div>
            </form>
          )}

          <PlanningHebdo
            creneaux={creneaux}
            onAddSlot={handleAddSlotFromGrid}
            onDeleteSlot={handleDeleteCreneau}
            showMedecinName={true}
          />
        </div>
      )}

      {/* ═══ Onglet : Stats ═══ */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard icon={Stethoscope} label="Médecins" value={stats?.nombreMedecins || 0} color="primary" />
            <StatCard icon={Activity} label="Consultations" value={stats?.nombreConsultations || 0} color="accent" />
            <StatCard icon={Calendar} label="RDV aujourd'hui" value={stats?.nombreRdvAujourdhui || 0} color="success" />
            <StatCard icon={Clock} label="Créneaux actifs" value={stats?.nombreCreneauxActifs || 0} color="warning" />
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Répartition des créneaux par type</h3>
            {creneaux.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun créneau attribué</p>
            ) : (
              <div className="space-y-3">
                {TYPE_OPTIONS.map(t => {
                  const count = creneaux.filter(c => c.type === t.value).length
                  const percent = creneaux.length > 0 ? Math.round((count / creneaux.length) * 100) : 0
                  return (
                    <div key={t.value}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{t.label}</span>
                        <span className="text-slate-500">{count} ({percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Charge par médecin</h3>
            <div className="space-y-2">
              {medecins.map(m => {
                const myCreneaux = creneaux.filter(c => c.medecinId === m.id).length
                const max = Math.max(...medecins.map(md => creneaux.filter(c => c.medecinId === md.id).length), 1)
                const percent = (myCreneaux / max) * 100
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-slate-700 truncate">Dr. {m.prenom} {m.nom}</div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="w-16 text-right text-xs text-slate-500">{myCreneaux} créneau(x)</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Onglet : Organigramme ═══ */}
      {tab === 'organigramme' && <OrganigrammeView />}

      {/* ═══ Onglet : Messages ═══ */}
      {tab === 'messages' && <MessagesPanel />}
    </DashboardLayout>
  )
}
