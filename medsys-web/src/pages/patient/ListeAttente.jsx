import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:8085'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function formatDateFr(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ListeAttente() {
  const { user, token } = useAuth()
  const [medecins, setMedecins] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [form, setForm] = useState({
    doctorId: '',
    weekStartDate: formatDate(getMonday(new Date())),
    patientName: `${user?.prenom || ''} ${user?.nom || ''}`.trim(),
    email: user?.email || '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  useEffect(() => {
    // Charger les médecins
    fetch('http://localhost:8081/api/v1/medecins', { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMedecins(Array.isArray(data) ? data : []))
      .catch(() => setMedecins([]))

    // Charger les inscriptions existantes depuis localStorage
    const saved = localStorage.getItem('waitingList_' + user?.id)
    if (saved) setInscriptions(JSON.parse(saved))
  }, [])

  async function sInscrire() {
    if (!form.doctorId || !form.weekStartDate || !form.patientName || !form.email) {
      setAlert({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires.' })
      return
    }
    setLoading(true)
    try {
      const body = {
        doctorId: parseInt(form.doctorId),
        weekStartDate: form.weekStartDate,
        patientName: form.patientName,
        email: form.email,
        phone: form.phone || null
      }
      const r = await fetch(`${API}/api/waiting-list`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
      if (r.ok) {
        const data = await r.json()
        const newList = [...inscriptions, data]
        setInscriptions(newList)
        localStorage.setItem('waitingList_' + user?.id, JSON.stringify(newList))
        setAlert({ type: 'success', message: 'Inscription sur liste d\'attente confirmée ! Vous serez notifié(e) si un créneau se libère.' })
        setForm(f => ({ ...f, doctorId: '', phone: '' }))
      } else {
        const err = await r.text()
        setAlert({ type: 'error', message: err || 'Erreur lors de l\'inscription.' })
      }
    } catch {
      setAlert({ type: 'error', message: 'Erreur réseau. Vérifiez que le service est démarré.' })
    }
    setLoading(false)
  }

  async function seDesinscrire(inscription) {
    if (!window.confirm('Se désinscrire de cette liste d\'attente ?')) return
    try {
      const r = await fetch(`${API}/api/waiting-list/${inscription.id}?email=${encodeURIComponent(inscription.email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (r.ok) {
        const newList = inscriptions.filter(i => i.id !== inscription.id)
        setInscriptions(newList)
        localStorage.setItem('waitingList_' + user?.id, JSON.stringify(newList))
        setAlert({ type: 'success', message: 'Désinscription effectuée.' })
      }
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors de la désinscription.' })
    }
  }

  // Calculer la semaine suivante
  const semaineSuivante = () => {
    const d = new Date(form.weekStartDate)
    d.setDate(d.getDate() + 7)
    setForm(f => ({ ...f, weekStartDate: formatDate(d) }))
  }
  const semainePrecedente = () => {
    const d = new Date(form.weekStartDate)
    d.setDate(d.getDate() - 7)
    if (d >= getMonday(new Date())) {
      setForm(f => ({ ...f, weekStartDate: formatDate(d) }))
    }
  }

  return (
    <div className="space-y-6">
      {alert && (
        <div className={`p-4 rounded-xl border text-sm ${
          alert.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex justify-between">
            <span>{alert.message}</span>
            <button onClick={() => setAlert(null)} className="ml-4 font-bold">×</button>
          </div>
        </div>
      )}

      {/* Formulaire inscription */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-1">S'inscrire sur liste d'attente</h3>
        <p className="text-sm text-slate-500 mb-6">
          Si tous les créneaux d'une semaine sont pris, inscrivez-vous ici. Vous serez notifié(e) dès qu'un créneau se libère.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Médecin */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Médecin *</label>
            <select
              value={form.doctorId}
              onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
              className="input w-full"
            >
              <option value="">— Sélectionner un médecin —</option>
              {medecins.map(m => (
                <option key={m.id} value={m.id}>
                  Dr. {m.prenom} {m.nom} {m.specialite ? `— ${m.specialite}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Semaine */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Semaine souhaitée *</label>
            <div className="flex items-center gap-3">
              <button onClick={semainePrecedente} className="btn-ghost btn-sm">←</button>
              <div className="flex-1 input text-center bg-slate-50">
                Semaine du {formatDateFr(form.weekStartDate)}
              </div>
              <button onClick={semaineSuivante} className="btn-ghost btn-sm">→</button>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nom complet *</label>
            <input
              type="text"
              value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              className="input w-full"
              placeholder="Votre nom complet"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input w-full"
              placeholder="votre@email.com"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input w-full"
              placeholder="+212 6..."
            />
          </div>
        </div>

        <button
          onClick={sInscrire}
          disabled={loading}
          className="btn-primary mt-6"
        >
          {loading ? 'Inscription en cours...' : '+ S\'inscrire sur la liste d\'attente'}
        </button>
      </div>

      {/* Mes inscriptions */}
      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Mes inscriptions en attente</h3>
          <p className="text-sm text-slate-500 mt-0.5">{inscriptions.length} inscription(s)</p>
        </div>
        {inscriptions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="text-4xl mb-3">⏳</div>
            <p>Aucune inscription en attente.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {inscriptions.map(insc => (
              <div key={insc.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    Semaine du {formatDateFr(insc.weekStartDate)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Médecin ID: {insc.doctorId} · {insc.email}
                  </div>
                  {insc.notifiedAt && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Notifié(e) le {formatDateFr(insc.notifiedAt)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => seDesinscrire(insc)}
                  className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                >
                  Se désinscrire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
