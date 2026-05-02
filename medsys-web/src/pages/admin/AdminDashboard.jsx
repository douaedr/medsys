import { useEffect, useState } from 'react'
import { adminApi } from '../../api/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import LoadingState from '../../components/shared/LoadingState'
import EmptyState from '../../components/shared/EmptyState'
import { useTab } from '../../lib/useTab'
import {
  Users, UserCog, Shield, Activity, Plus, Lock, Unlock, Trash2,
  Settings, Stethoscope, Search
} from 'lucide-react'

export default function AdminDashboard() {
  const [tab, setTab] = useTab('dashboard')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '', role: 'MEDECIN' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminApi.listUsers()
      setUsers(res.data || [])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createPersonnel(form)
      setShowCreate(false)
      setForm({ email: '', password: '', nom: '', prenom: '', role: 'MEDECIN' })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const stats = {
    total: users.length,
    medecins: users.filter(u => u.role === 'MEDECIN').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    actifs: users.filter(u => u.enabled).length,
    personnel: users.filter(u => ['PERSONNEL', 'SECRETARY'].includes(u.role)).length,
    directeurs: users.filter(u => u.role === 'DIRECTEUR').length,
    patients: users.filter(u => u.role === 'PATIENT').length,
  }

  const filteredUsers = (roleFilter) => {
    let list = users
    if (roleFilter) list = list.filter(u => roleFilter.includes(u.role))
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(u =>
        `${u.prenom} ${u.nom}`.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      )
    }
    return list
  }

  const handleToggle = async (id) => { await adminApi.toggleUser(id); load() }
  const handleDelete = async (u) => {
    if (confirm(`Supprimer ${u.prenom} ${u.nom} ?`)) {
      await adminApi.deleteUser(u.id); load()
    }
  }

  if (loading) return <DashboardLayout title="Administration"><LoadingState /></DashboardLayout>

  const subtitles = {
    dashboard: "Vue d'ensemble de la plateforme",
    users: 'Tous les utilisateurs du système',
    personnel: 'Médecins, secrétaires et personnel soignant',
    settings: 'Paramètres et configuration',
  }
  const titles = {
    dashboard: 'Administration',
    users: 'Utilisateurs',
    personnel: 'Personnel',
    settings: 'Paramètres',
  }

  // Helper pour rendre une table d'utilisateurs (utilisé dans plusieurs onglets)
  const renderUsersTable = (list, title, allowedRoles) => (
    <div className="card">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{list.length} compte(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:bg-white w-56"
            />
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-6 bg-slate-50 border-b border-slate-100 grid md:grid-cols-2 gap-4">
          <div><label className="label">Prénom</label>
            <input className="input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></div>
          <div><label className="label">Nom</label>
            <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
          <div><label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Mot de passe</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div><label className="label">Rôle</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select></div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Créer le compte</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Annuler</button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur"
          description={search ? "Aucun résultat pour cette recherche." : "Créez votre premier utilisateur."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                        {(u.prenom?.[0] || '') + (u.nom?.[0] || '')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{u.prenom} {u.nom}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge-info">{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    {u.enabled ? <span className="badge-success">Actif</span> : <span className="badge-neutral">Désactivé</span>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => handleToggle(u.id)} className="btn-ghost btn-sm" title={u.enabled ? 'Désactiver' : 'Activer'}>
                      {u.enabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(u)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <DashboardLayout title={titles[tab]} subtitle={subtitles[tab]}>
      {/* ═══ ONGLET : Tableau de bord ═══ */}
      {tab === 'dashboard' && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="Utilisateurs" value={stats.total} color="primary" />
            <StatCard icon={UserCog} label="Médecins" value={stats.medecins} color="accent" />
            <StatCard icon={Shield} label="Administrateurs" value={stats.admins} color="warning" />
            <StatCard icon={Activity} label="Comptes actifs" value={stats.actifs} color="success" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Répartition par rôle</h3>
              <div className="space-y-3">
                {[
                  { label: 'Administrateurs', value: stats.admins, color: 'bg-amber-500' },
                  { label: 'Directeurs', value: stats.directeurs, color: 'bg-purple-500' },
                  { label: 'Médecins', value: stats.medecins, color: 'bg-sky-500' },
                  { label: 'Personnel soignant', value: stats.personnel, color: 'bg-emerald-500' },
                  { label: 'Patients', value: stats.patients, color: 'bg-pink-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all`}
                        style={{ width: `${stats.total ? (item.value / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button onClick={() => setTab('users')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                  <UserCog className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Gérer les utilisateurs</div>
                    <div className="text-xs text-slate-500">Voir, créer, désactiver des comptes</div>
                  </div>
                </button>
                <button onClick={() => setTab('personnel')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                  <Stethoscope className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Personnel soignant</div>
                    <div className="text-xs text-slate-500">Médecins, infirmiers, secrétaires</div>
                  </div>
                </button>
                <button onClick={() => setTab('settings')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-all">
                  <Settings className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Paramètres</div>
                    <div className="text-xs text-slate-500">Configuration de la plateforme</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ ONGLET : Utilisateurs ═══ */}
      {tab === 'users' && renderUsersTable(
        filteredUsers(),
        'Utilisateurs',
        ['MEDECIN', 'PERSONNEL', 'SECRETARY', 'DIRECTEUR']
      )}

      {/* ═══ ONGLET : Personnel ═══ */}
      {tab === 'personnel' && renderUsersTable(
        filteredUsers(['MEDECIN', 'PERSONNEL', 'SECRETARY']),
        'Personnel soignant',
        ['MEDECIN', 'PERSONNEL', 'SECRETARY']
      )}

      {/* ═══ ONGLET : Paramètres ═══ */}
      {tab === 'settings' && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Paramètres système</h3>
          <div className="space-y-4">
            {[
              { label: 'Version de la plateforme', value: 'MedSys v1.0.0', badge: 'Stable' },
              { label: 'Microservices actifs', value: '5 services en ligne', badge: 'Tous OK' },
              { label: 'Base de données', value: 'MySQL — port 3307', badge: 'Connectée' },
              { label: 'Chatbot IA', value: 'Powered by Gemini', badge: 'Actif' },
            ].map(item => (
              <div key={item.label} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.value}</div>
                </div>
                <span className="badge-success">{item.badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
