import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useTab } from '../lib/useTab'
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const API = 'http://localhost:8081'

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  EN_COURS: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: Clock },
  TERMINE: { label: 'Termine', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  ANNULE: { label: 'Annule', color: 'bg-red-100 text-red-700', icon: XCircle },
}

function NouvelleFiche({ infirmierId, token, onCreated }) {
  const [form, setForm] = useState({
    patientId: '', patientNom: '', patientPrenom: '',
    serviceDepart: '', serviceArrivee: '', motif: '',
    urgence: false, notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async () => {
    if (!form.patientNom || !form.patientPrenom || !form.serviceDepart || !form.serviceArrivee || !form.motif) {
      setMsg({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' })
      return
    }
    setLoading(true)
    const res = await fetch(`${API}/api/transport`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, patientId: form.patientId || 0, infirmierId })
    })
    setLoading(false)
    if (res.ok) {
      setMsg({ type: 'success', text: 'Fiche transport creee !' })
      setForm({ patientId: '', patientNom: '', patientPrenom: '', serviceDepart: '', serviceArrivee: '', motif: '', urgence: false, notes: '' })
      onCreated()
    } else {
      setMsg({ type: 'error', text: 'Erreur lors de la creation.' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-bold text-slate-900 text-lg">Nouvelle fiche transport</h3>
      {msg && (
        <div className={`p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nom patient *</label>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={form.patientNom} onChange={e => setForm({ ...form, patientNom: e.target.value })} placeholder="Nom" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Prenom patient *</label>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={form.patientPrenom} onChange={e => setForm({ ...form, patientPrenom: e.target.value })} placeholder="Prenom" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Service depart *</label>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={form.serviceDepart} onChange={e => setForm({ ...form, serviceDepart: e.target.value })} placeholder="Ex: Cardiologie" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Service arrivee *</label>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={form.serviceArrivee} onChange={e => setForm({ ...form, serviceArrivee: e.target.value })} placeholder="Ex: Radiologie" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Motif *</label>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} placeholder="Motif du transport" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
          <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes supplementaires..." />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="urgence" checked={form.urgence}
            onChange={e => setForm({ ...form, urgence: e.target.checked })}
            className="w-4 h-4 accent-red-500" />
          <label htmlFor="urgence" className="text-sm font-semibold text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Urgence
          </label>
        </div>
      </div>
      <button onClick={submit} disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
        <Plus className="w-4 h-4" />
        {loading ? 'Creation...' : 'Creer la fiche'}
      </button>
    </div>
  )
}

function MesFiches({ infirmierId, token, refresh }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/transport/infirmier/${infirmierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      setFiches(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [refresh])

  if (loading) return <div className="flex justify-center p-8"><div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">Mes fiches transport ({fiches.length})</h3>
      </div>
      {fiches.length === 0 ? (
        <div className="p-8 text-center text-slate-400">Aucune fiche creee.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {fiches.map(f => {
            const cfg = STATUT_CONFIG[f.statut] || STATUT_CONFIG.EN_ATTENTE
            return (
              <div key={f.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                {f.urgence && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">{f.patientPrenom} {f.patientNom}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.serviceDepart} → {f.serviceArrivee}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{f.motif}</div>
                  {f.notes && <div className="text-xs text-slate-400 italic mt-0.5">{f.notes}</div>}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function InfirmierDashboard() {
  const { user, token } = useAuth()
  const [tab] = useTab('nouvelle')
  const [refresh, setRefresh] = useState(0)
  const infirmierId = user?.personnelId || user?.id

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Infirmier(e)</h1>
          <p className="text-gray-500 text-sm">Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>
        <div className="min-h-96">
          {tab === 'nouvelle' && (
            <div className="space-y-6">
              <NouvelleFiche infirmierId={infirmierId} token={token} onCreated={() => setRefresh(r => r + 1)} />
              <MesFiches infirmierId={infirmierId} token={token} refresh={refresh} />
            </div>
          )}
          {tab === 'fiches' && <MesFiches infirmierId={infirmierId} token={token} refresh={refresh} />}
        </div>
      </div>
    </DashboardLayout>
  )
}