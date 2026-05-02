import { useState, useEffect } from 'react'
import { patientApi } from '../../api/api'
import { Calendar, Clock, User, FileText, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react'

// ─── Horaires disponibles ──────────────────────────────────────────────────
const HORAIRES = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
]

const MOTIF_TYPES = [
  'Consultation générale',
  'Suivi de traitement',
  'Urgence non-critique',
  'Bilan de santé',
  'Renouvellement d\'ordonnance',
  'Autre',
]

export default function NouveauRdv({ onBack, onSuccess }) {
  const [etape, setEtape] = useState(1) // 1=médecin, 2=date/heure, 3=motif, 4=confirmation
  const [medecins, setMedecins] = useState([])
  const [loadingMedecins, setLoadingMedecins] = useState(true)
  const [selectedMedecin, setSelectedMedecin] = useState(null)
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [motifType, setMotifType] = useState(MOTIF_TYPES[0])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    patientApi.getMedecins()
      .then(r => setMedecins(r.data || []))
      .catch(() => setMedecins([]))
      .finally(() => setLoadingMedecins(false))
  }, [])

  const initiales = (prenom, nom) => {
    const p = (prenom || '').charAt(0).toUpperCase()
    const n = (nom || '').charAt(0).toUpperCase()
    return p + n || '?'
  }

  const handleSubmit = async () => {
    setError('')
    if (!selectedMedecin) return setError('Veuillez sélectionner un médecin.')
    if (!date) return setError('Veuillez choisir une date.')
    if (!heure) return setError('Veuillez choisir une heure.')

    const dateHeure = `${date}T${heure}:00`
    const motif = motifType + (description ? ` — ${description}` : '')

    setLoading(true)
    try {
      await patientApi.creerRdv({
        medecinId: selectedMedecin.id,
        dateHeure,
        motif,
      })
      setSuccess(true)
      setTimeout(() => onSuccess?.(), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la prise de rendez-vous.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Succès ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Rendez-vous confirmé !</h2>
        <p className="text-slate-500 text-sm">
          Votre demande a été envoyée avec succès.<br />Vous allez être redirigé…
        </p>
      </div>
    )
  }

  // ─── Steps indicator ───────────────────────────────────────────────────────
  const steps = ['Médecin', 'Date & heure', 'Motif', 'Confirmation']

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Nouveau rendez-vous</h2>
          <p className="text-sm text-slate-500">Étape {etape} sur {steps.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
              i + 1 < etape ? 'bg-emerald-500 text-white'
              : i + 1 === etape ? 'bg-primary-600 text-white'
              : 'bg-slate-200 text-slate-500'
            }`}>
              {i + 1 < etape ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i + 1 === etape ? 'text-primary-600' : 'text-slate-400'}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full ${i + 1 < etape ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ═══ ÉTAPE 1 : Sélection médecin ═══ */}
      {etape === 1 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Choisissez un médecin</h3>
          </div>

          {loadingMedecins ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : medecins.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Aucun médecin disponible pour le moment.
            </div>
          ) : (
            <div className="space-y-2">
              {medecins.map(med => (
                <button
                  key={med.id}
                  onClick={() => { setSelectedMedecin(med); setEtape(2) }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all group ${
                    selectedMedecin?.id === med.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    selectedMedecin?.id === med.id
                      ? 'bg-primary-200 text-primary-800'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-primary-100 group-hover:text-primary-700'
                  }`}>
                    {initiales(med.prenom, med.nom)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      Dr. {med.prenom} {med.nom}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {med.specialite || med.specialiteNom || 'Médecine générale'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ ÉTAPE 2 : Date et heure ═══ */}
      {etape === 2 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Choisissez une date et une heure</h3>
          </div>

          {/* Médecin sélectionné */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-5 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
              {initiales(selectedMedecin?.prenom, selectedMedecin?.nom)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Dr. {selectedMedecin?.prenom} {selectedMedecin?.nom}
              </p>
              <p className="text-xs text-slate-400">
                {selectedMedecin?.specialite || selectedMedecin?.specialiteNom || 'Médecine générale'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Date *</label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Heure *</label>
              <select
                value={heure}
                onChange={e => setHeure(e.target.value)}
                className="input w-full"
              >
                <option value="">-- Choisir --</option>
                {HORAIRES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setEtape(1)} className="btn-ghost flex-1">
              Retour
            </button>
            <button
              onClick={() => {
                if (!date || !heure) { setError('Date et heure obligatoires.'); return }
                setError(''); setEtape(3)
              }}
              className="btn-primary flex-1"
            >
              Continuer
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      )}

      {/* ═══ ÉTAPE 3 : Motif ═══ */}
      {etape === 3 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Motif de consultation</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Type de consultation *</label>
              <select
                value={motifType}
                onChange={e => setMotifType(e.target.value)}
                className="input w-full"
              >
                {MOTIF_TYPES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Description <span className="text-slate-400">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez brièvement vos symptômes ou la raison de votre visite…"
                rows={3}
                className="input w-full resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => setEtape(2)} className="btn-ghost flex-1">Retour</button>
            <button onClick={() => setEtape(4)} className="btn-primary flex-1">Continuer</button>
          </div>
        </div>
      )}

      {/* ═══ ÉTAPE 4 : Confirmation ═══ */}
      {etape === 4 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Récapitulatif</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Médecin</span>
              <span className="font-medium text-slate-900">
                Dr. {selectedMedecin?.prenom} {selectedMedecin?.nom}
              </span>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Spécialité</span>
              <span className="font-medium text-slate-900">
                {selectedMedecin?.specialite || selectedMedecin?.specialiteNom || 'Médecine générale'}
              </span>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-900">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Heure</span>
              <span className="font-medium text-slate-900">{heure}</span>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Motif</span>
              <span className="font-medium text-slate-900 text-right max-w-[60%]">
                {motifType}{description ? ` — ${description}` : ''}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setEtape(3)} className="btn-ghost flex-1" disabled={loading}>
              Retour
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Envoi…' : 'Confirmer le RDV'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
