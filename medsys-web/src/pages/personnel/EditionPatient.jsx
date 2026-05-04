import { useState, useEffect } from 'react'
import { patientApi } from '../../api/api'
import { User, Save, Search, CheckCircle, AlertCircle, Edit3, Phone, Mail, MapPin, Droplet, CreditCard } from 'lucide-react'

export default function EditionPatient() {
  const [patients, setPatients]           = useState([])
  const [selected, setSelected]           = useState(null)
  const [search, setSearch]               = useState('')
  const [loading, setLoading]             = useState(false)
  const [saving, setSaving]               = useState(false)
  const [success, setSuccess]             = useState('')
  const [error, setError]                 = useState('')
  const [form, setForm]                   = useState({})

  useEffect(() => {
    setLoading(true)
    patientApi.getAll({ size: 200 })
      .then(r => setPatients(r.data?.content || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    (p.nom + ' ' + p.prenom + ' ' + (p.cin || '') + ' ' + (p.email || ''))
      .toLowerCase().includes(search.toLowerCase())
  )

  const selectPatient = (p) => {
    setSelected(p)
    setSuccess(''); setError('')
    setForm({
      nom: p.nom || '',
      prenom: p.prenom || '',
      email: p.email || '',
      telephone: p.telephone || '',
      adresse: p.adresse || '',
      ville: p.ville || '',
      cin: p.cin || '',
      groupeSanguin: p.groupeSanguin || '',
      mutuelle: p.mutuelle || '',
      notes: p.notes || '',
      dateNaissance: p.dateNaissance || ''
    })
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true); setSuccess(''); setError('')
    try {
      await patientApi.update(selected.id, form)
      setSuccess('Dossier patient mis a jour avec succes !')
      patientApi.getAll({ size: 200 })
        .then(r => setPatients(r.data?.content || r.data || []))
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || 'Erreur lors de la mise a jour'
      setError(typeof msg === 'string' ? msg : 'Erreur lors de la mise a jour')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, field, type = 'text', icon: Icon, placeholder }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          type={type}
          value={form[field] || ''}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          placeholder={placeholder || label}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 focus:bg-white transition-all`}
        />
      </div>
    </div>
  )

  return (
    <div className="flex gap-6 h-full">
      {/* Liste patients */}
      <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Patients</h3>
            <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{patients.length}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Aucun patient</p>
          ) : (
            filtered.slice(0, 50).map(p => (
              <button
                key={p.id}
                onClick={() => selectPatient(p)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 transition-all ${
                  selected?.id === p.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="font-medium">{p.nom} {p.prenom}</p>
                {p.cin && <p className={`text-xs mt-0.5 ${selected?.id === p.id ? 'text-blue-100' : 'text-gray-400'}`}>CIN: {p.cin}</p>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Formulaire edition */}
      <div className="flex-1">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Selectionnez un patient</p>
              <p className="text-sm mt-1">pour modifier son dossier</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selected.nom} {selected.prenom}</h2>
                <p className="text-sm text-gray-500">Modification du dossier patient</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-all shadow-md text-sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nom" field="nom" icon={User} />
                <Field label="Prenom" field="prenom" icon={User} />
                <Field label="Email" field="email" type="email" icon={Mail} />
                <Field label="Telephone" field="telephone" icon={Phone} />
                <Field label="CIN" field="cin" icon={CreditCard} />
                <Field label="Date de naissance" field="dateNaissance" type="date" />
                <Field label="Groupe sanguin" field="groupeSanguin" icon={Droplet} placeholder="Ex: A+" />
                <Field label="Mutuelle" field="mutuelle" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Adresse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Adresse" field="adresse" icon={MapPin} />
                </div>
                <Field label="Ville" field="ville" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Notes</h3>
              <textarea
                value={form.notes || ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes medicales, allergies, informations importantes..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}