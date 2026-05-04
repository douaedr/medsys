import { useState, useEffect } from 'react'
import { secretaireApi, patientApi } from '../../api/api'
import { Calendar, Clock, User, Stethoscope, FileText, CheckCircle, AlertCircle, Search } from 'lucide-react'

export default function GestionRDVSecretaire() {
  const [patients, setPatients]     = useState([])
  const [medecins, setMedecins]     = useState([])
  const [slots, setSlots]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')
  const [searchP, setSearchP]       = useState('')
  const [searchM, setSearchM]       = useState('')

  const [form, setForm] = useState({
    patientId: '',
    medecinId: '',
    dateHeure: '',
    motif: ''
  })

  useEffect(() => {
    patientApi.getAll({ size: 100 })
      .then(r => setPatients(r.data?.content || r.data || []))
      .catch(() => {})
    secretaireApi.getInfo()
      .then(r => { const m = r.data?.medecinAssigne; if (m) setMedecins([m]) })
      .catch(() => {})
      .then(r => setMedecins(r.data?.content || r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (form.medecinId) {
      secretaireApi.getSlotsSemaine()
        .then(r => setSlots(r.data || []))
        .catch(() => setSlots([]))
    }
  }, [form.medecinId])

  const filteredPatients = patients.filter(p =>
    (p.nom + ' ' + p.prenom + ' ' + (p.cin || '')).toLowerCase().includes(searchP.toLowerCase())
  )
  const filteredMedecins = medecins.filter(m =>
    (m.nom + ' ' + m.prenom + ' ' + (m.specialite || '')).toLowerCase().includes(searchM.toLowerCase())
  )

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!form.patientId || !form.medecinId || !form.dateHeure) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    try {
      await secretaireApi.creerRdvSecretaire({
        patientId: Number(form.patientId),
        medecinId: Number(form.medecinId),
        dateHeure: form.dateHeure,
        motif: form.motif
      })
      setSuccess('RDV cree avec succes !')
      setForm({ patientId: '', medecinId: '', dateHeure: '', motif: '' })
      setSearchP(''); setSearchM('')
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || 'Erreur lors de la creation du RDV'
      setError(typeof msg === 'string' ? msg : 'Erreur lors de la creation du RDV')
    } finally {
      setLoading(false)
    }
  }

  const selectedPatient = patients.find(p => String(p.id) === String(form.patientId))
  const selectedMedecin = medecins.find(m => String(m.id) === String(form.medecinId))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Nouveau Rendez-vous</h2>
          <p className="text-sm text-gray-500">Creer un RDV pour un patient</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selection patient */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Patient <span className="text-red-500">*</span></h3>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchP}
              onChange={e => setSearchP(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredPatients.slice(0, 20).map(p => (
              <button
                key={p.id}
                onClick={() => setForm(f => ({ ...f, patientId: p.id }))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  String(form.patientId) === String(p.id)
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-medium">{p.nom} {p.prenom}</span>
                {p.cin && <span className="ml-2 opacity-70 text-xs">CIN: {p.cin}</span>}
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Aucun patient trouve</p>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 font-medium">
              Selectionne : {selectedPatient.nom} {selectedPatient.prenom}
            </div>
          )}
        </div>

        {/* Selection medecin */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-700">Medecin <span className="text-red-500">*</span></h3>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un medecin..."
              value={searchM}
              onChange={e => setSearchM(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredMedecins.slice(0, 20).map(m => (
              <button
                key={m.id}
                onClick={() => setForm(f => ({ ...f, medecinId: m.id }))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  String(form.medecinId) === String(m.id)
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-medium">Dr. {m.nom} {m.prenom}</span>
                {m.specialite && <span className="ml-2 opacity-70 text-xs">{m.specialite}</span>}
              </button>
            ))}
            {filteredMedecins.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Aucun medecin trouve</p>
            )}
          </div>
          {selectedMedecin && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg text-xs text-green-700 font-medium">
              Selectionne : Dr. {selectedMedecin.nom} {selectedMedecin.prenom}
            </div>
          )}
        </div>

        {/* Date/heure */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-700">Date et heure <span className="text-red-500">*</span></h3>
          </div>
          <input
            type="datetime-local"
            value={form.dateHeure}
            onChange={e => setForm(f => ({ ...f, dateHeure: e.target.value }))}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Motif */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-700">Motif</h3>
          </div>
          <textarea
            value={form.motif}
            onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
            placeholder="Motif de la consultation (optionnel)..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-base shadow-md"
      >
        {loading ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creation en cours...</>
        ) : (
          <><Calendar className="w-5 h-5" />Confirmer le Rendez-vous</>
        )}
      </button>
    </div>
  )
}
