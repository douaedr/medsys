import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import MonEmploiDuTemps from './personnel/MonEmploiDuTemps'
import MessagesPanel from '../components/messages/MessagesPanel'
import { useTab } from '../lib/useTab'
import { CheckCircle, Clock, AlertTriangle, Truck } from 'lucide-react'

const API = 'http://localhost:8081'

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  EN_COURS: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  TERMINE: { label: 'Termine', color: 'bg-emerald-100 text-emerald-700' },
  ANNULE: { label: 'Annule', color: 'bg-red-100 text-red-700' },
}

function FichesEnAttente({ brancardierId, token, refresh, onAction }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const charger = () => {
    setLoading(true)
    fetch(`${API}/api/transport/en-attente`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      setFiches(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { charger() }, [refresh])

  const prendreEnCharge = async (id) => {
    const res = await fetch(`${API}/api/transport/${id}/prendre-en-charge`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'X-Brancardier-Id': String(brancardierId) }
    })
    if (res.ok) {
      setMsg({ type: 'success', text: 'Fiche prise en charge !' })
      onAction()
    } else {
      setMsg({ type: 'error', text: 'Erreur.' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  if (loading) return <div className="flex justify-center p-8"><div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-900">Fiches en attente ({fiches.length})</h3>
      </div>
      {msg && (
        <div className={`mx-4 mt-3 p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}
      {fiches.length === 0 ? (
        <div className="p-8 text-center text-slate-400">Aucune fiche en attente.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {fiches.map(f => (
            <div key={f.id} className={`p-4 flex items-start gap-4 hover:bg-slate-50 ${f.urgence ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {f.urgence && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <div className="font-semibold text-slate-900 text-sm">{f.patientPrenom} {f.patientNom}</div>
                  {f.urgence && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">URGENT</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">{f.serviceDepart} → {f.serviceArrivee}</div>
                <div className="text-xs text-slate-400 mt-0.5">{f.motif}</div>
                {f.notes && <div className="text-xs text-slate-400 italic mt-0.5">{f.notes}</div>}
              </div>
              <button onClick={() => prendreEnCharge(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shrink-0">
                <Truck className="w-3.5 h-3.5" />
                Prendre en charge
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MesTransports({ brancardierId, token, refresh }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const charger = () => {
    setLoading(true)
    fetch(`${API}/api/transport/brancardier/${brancardierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      setFiches(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { charger() }, [refresh])

  const terminer = async (id) => {
    const res = await fetch(`${API}/api/transport/${id}/terminer`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'X-Brancardier-Id': String(brancardierId) }
    })
    if (res.ok) {
      setMsg({ type: 'success', text: 'Transport termine !' })
      charger()
    } else {
      setMsg({ type: 'error', text: 'Erreur.' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  if (loading) return <div className="flex justify-center p-8"><div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-slate-900">Mes transports ({fiches.length})</h3>
      </div>
      {msg && (
        <div className={`mx-4 mt-3 p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}
      {fiches.length === 0 ? (
        <div className="p-8 text-center text-slate-400">Aucun transport assigne.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {fiches.map(f => {
            const cfg = STATUT_CONFIG[f.statut] || STATUT_CONFIG.EN_ATTENTE
            return (
              <div key={f.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">{f.patientPrenom} {f.patientNom}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.serviceDepart} → {f.serviceArrivee}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{f.motif}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  {f.statut === 'EN_COURS' && (
                    <button onClick={() => terminer(f.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Terminer
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BrancardierDashboard() {
  const { user, token } = useAuth()
  const [tab] = useTab('dashboard')
  const [refresh, setRefresh] = useState(0)
  const brancardierId = user?.personnelId || user?.userId

  const tabs = [
    { id: 'dashboard', label: '🚑 Transports' },
    { id: 'historique', label: '📋 Historique' },
    { id: 'planning', label: '📅 Mon planning' },
    { id: 'messages', label: '💬 Messagerie' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Brancardier</h1>
          <p className="text-gray-500 text-sm">Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {tabs.map(t => (
            <a key={t.id} href={"?tab=" + t.id}
              className={"px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px " +
                (tab === t.id ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
              {t.label}
            </a>
          ))}
        </div>

        <div className="min-h-96">
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <FichesEnAttente brancardierId={brancardierId} token={token} refresh={refresh} onAction={() => setRefresh(r => r + 1)} />
              <MesTransports brancardierId={brancardierId} token={token} refresh={refresh} />
            </div>
          )}
          {tab === 'historique' && <MesTransports brancardierId={brancardierId} token={token} refresh={refresh} />}
          {tab === 'planning' && <MonEmploiDuTemps />}
          {tab === 'messages' && <MessagesPanel />}
        </div>
      </div>
    </DashboardLayout>
  )
}