import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { UserPlus, UserMinus, Users, Search } from 'lucide-react'

const AUTH_API = 'http://localhost:8082'
const CHEF_API = 'http://localhost:8081'

const ROLE_LABELS = {
  INFIRMIER: { label: 'Infirmier(e)', color: 'bg-teal-100 text-teal-700' },
  SECRETARY: { label: 'Secretaire', color: 'bg-violet-100 text-violet-700' },
  AIDE_SOIGNANT: { label: 'Aide soignant(e)', color: 'bg-orange-100 text-orange-700' },
  MEDECIN: { label: 'Medecin', color: 'bg-blue-100 text-blue-700' },
  BRANCARDIER: { label: 'Brancardier', color: 'bg-slate-100 text-slate-700' },
}

export default function AppartenanceService() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const [serviceId, setServiceId] = useState(null)
  const [serviceNom, setServiceNom] = useState('')
  const [monPersonnel, setMonPersonnel] = useState([])
  const [autrePersonnel, setAutrePersonnel] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  // Recuperer le serviceId du chef connecte
  useEffect(() => {
    fetch(`${CHEF_API}/api/chef/liste`, { headers })
      .then(r => r.json())
      .then(chefs => {
        const chefId = user?.personnelId || user?.id
        const monService = chefs.find(c => String(c.personnelId) === String(chefId))
        if (monService) {
          setServiceId(monService.serviceId)
          setServiceNom(monService.nomService)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Charger le personnel une fois serviceId connu
  useEffect(() => {
    if (!serviceId) return
    chargerPersonnel()
  }, [serviceId])

  const chargerPersonnel = () => {
    const roles = ['INFIRMIER', 'SECRETARY', 'AIDE_SOIGNANT', 'MEDECIN', 'BRANCARDIER']
    fetch(`${AUTH_API}/api/internal/users`, { headers })
      .then(r => r.json())
      .then(tous => {
        const personnel = tous.filter(u => roles.includes(u.role))
        setMonPersonnel(personnel.filter(u => u.serviceId === serviceId))
        setAutrePersonnel(personnel.filter(u => !u.serviceId || u.serviceId !== serviceId))
      })
  }

  const assigner = async (userId) => {
    const res = await fetch(`${AUTH_API}/api/internal/users/${userId}/service`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ serviceId })
    })
    if (res.ok) {
      setMsg({ type: 'success', text: 'Personnel assigne au service !' })
      chargerPersonnel()
    } else {
      setMsg({ type: 'error', text: 'Erreur lors de l\'assignation.' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  const retirer = async (userId) => {
    const res = await fetch(`${AUTH_API}/api/internal/users/${userId}/service`, {
      method: 'DELETE',
      headers
    })
    if (res.ok) {
      setMsg({ type: 'success', text: 'Personnel retire du service.' })
      chargerPersonnel()
    } else {
      setMsg({ type: 'error', text: 'Erreur lors du retrait.' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  const filtrer = (liste) => liste.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )

  if (!serviceId) return (
    <div className="card p-8 text-center text-slate-400">
      Aucun service trouve pour votre compte.
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header service */}
      <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <div className="font-bold text-blue-900 text-lg">{serviceNom}</div>
            <div className="text-sm text-blue-600">Gestion du personnel — {monPersonnel.length} membre(s) assigne(s)</div>
          </div>
        </div>
      </div>

      {/* Message feedback */}
      {msg && (
        <div className={`p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un membre du personnel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personnel de mon service */}
        <div className="card">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Mon service ({monPersonnel.length})</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filtrer(monPersonnel).length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Aucun personnel assigne.</div>
            ) : filtrer(monPersonnel).map(u => (
              <div key={u.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                  {(u.prenom?.[0] || '') + (u.nom?.[0] || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm">{u.prenom} {u.nom}</div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_LABELS[u.role]?.color || 'bg-slate-100 text-slate-600'}`}>
                  {ROLE_LABELS[u.role]?.label || u.role}
                </span>
                <button
                  onClick={() => retirer(u.id)}
                  className="ml-2 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Retirer du service"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Personnel disponible */}
        <div className="card">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Personnel disponible ({autrePersonnel.length})</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filtrer(autrePersonnel).length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Tout le personnel est assigne.</div>
            ) : filtrer(autrePersonnel).map(u => (
              <div key={u.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                  {(u.prenom?.[0] || '') + (u.nom?.[0] || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm">{u.prenom} {u.nom}</div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_LABELS[u.role]?.color || 'bg-slate-100 text-slate-600'}`}>
                  {ROLE_LABELS[u.role]?.label || u.role}
                </span>
                <button
                  onClick={() => assigner(u.id)}
                  className="ml-2 p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  title="Ajouter au service"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}