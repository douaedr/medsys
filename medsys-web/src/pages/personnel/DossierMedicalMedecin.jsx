import { useState, useEffect } from 'react'
import { patientApi } from '../../api/api'
import {
  User, Search, Save, Plus, Trash2, CheckCircle, AlertCircle,
  FileText, AlertTriangle, Pill, ClipboardList, Eye
} from 'lucide-react'

const TYPES_ANTECEDENT = [
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'CHIRURGICAL', label: 'Chirurgical' },
  { value: 'FAMILIAL', label: 'Familial' },
  { value: 'ALLERGIQUE', label: 'Allergique' },
  { value: 'GYNECOLOGIQUE', label: 'Gynecologique' },
  { value: 'TOXICOLOGIQUE', label: 'Toxicologique' },
  { value: 'VACCINAL', label: 'Vaccinal' },
]

const SEVERITES = ['FAIBLE', 'MODEREE', 'SEVERE', 'CRITIQUE']

export default function DossierMedicalMedecin() {
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [dossier, setDossier] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('apercu')

  const [form, setForm] = useState({
    allergies: '',
    traitementsEnCours: '',
    observations: '',
    antecedents: []
  })

  useEffect(() => {
    patientApi.getAll({ page: 0, size: 200 })
      .then(r => setPatients(r.data?.content || r.data || []))
      .catch(() => {})
  }, [])

  const filtered = patients.filter(p =>
    (p.nom + ' ' + p.prenom + ' ' + (p.cin || ''))
      .toLowerCase().includes(search.toLowerCase())
  )

  const selectPatient = async (p) => {
    setSelected(p)
    setSuccess(''); setError('')
    setLoading(true)
    try {
      const r = await patientApi.getDossier(p.id)
      const d = r.data
      setDossier(d)

      const allergiesAnt = d.antecedents?.find(a => a.source === 'ALLERGIES_LIBRES')
      const traitAnt = d.antecedents?.find(a => a.source === 'TRAITEMENTS_EN_COURS')
      const autresAnt = (d.antecedents || []).filter(
        a => a.source !== 'ALLERGIES_LIBRES' && a.source !== 'TRAITEMENTS_EN_COURS'
      )

      setForm({
        allergies: allergiesAnt?.description || '',
        traitementsEnCours: traitAnt?.description || '',
        observations: '',
        antecedents: autresAnt.map(a => ({
          id: a.id,
          typeAntecedent: a.typeAntecedent || 'MEDICAL',
          description: a.description || '',
          dateDiagnostic: a.dateDiagnostic || '',
          severite: a.severite || '',
          actif: a.actif !== false,
          source: a.source || ''
        }))
      })
    } catch (e) {
      setError('Erreur chargement dossier')
    } finally {
      setLoading(false)
    }
  }

  const addAntecedent = () => {
    setForm(f => ({
      ...f,
      antecedents: [...f.antecedents, {
        typeAntecedent: 'MEDICAL', description: '',
        dateDiagnostic: '', severite: '', actif: true, source: ''
      }]
    }))
  }

  const removeAntecedent = (i) => {
    setForm(f => ({ ...f, antecedents: f.antecedents.filter((_, idx) => idx !== i) }))
  }

  const updateAntecedent = (i, field, value) => {
    setForm(f => ({
      ...f,
      antecedents: f.antecedents.map((a, idx) => idx === i ? { ...a, [field]: value } : a)
    }))
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true); setSuccess(''); setError('')
    try {
      const payload = {
        allergies: form.allergies || null,
        traitementsEnCours: form.traitementsEnCours || null,
        observations: form.observations || null,
        antecedents: form.antecedents.map(a => ({
          id: a.id || null,
          typeAntecedent: a.typeAntecedent || 'MEDICAL',
          description: a.description || '',
          dateDiagnostic: a.dateDiagnostic || null,
          severite: a.severite || null,
          actif: a.actif !== false,
          source: a.source || null
        }))
      }
      await patientApi.updateDossier(selected.id, payload)
      setSuccess('Dossier medical mis a jour avec succes !')
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'apercu', label: 'Apercu', icon: Eye },
    { id: 'antecedents', label: 'Antecedents', icon: ClipboardList },
    { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
    { id: 'traitements', label: 'Traitements', icon: Pill },
    { id: 'observations', label: 'Observations', icon: FileText },
  ]

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
          {filtered.slice(0, 50).map(p => (
            <button
              key={p.id}
              onClick={() => selectPatient(p)}
              className={"w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 transition-all " +
                (selected?.id === p.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700')}
            >
              <p className="font-medium">{p.nom} {p.prenom}</p>
              {p.cin && <p className={"text-xs mt-0.5 " + (selected?.id === p.id ? 'text-blue-100' : 'text-gray-400')}>CIN: {p.cin}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu dossier */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Selectionnez un patient</p>
              <p className="text-sm mt-1">pour consulter et editer son dossier medical</p>
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selected.nom} {selected.prenom}</h2>
                <p className="text-sm text-gray-500">
                  Dossier {dossier?.numeroDossier} · {selected.groupeSanguin || 'Groupe sanguin inconnu'}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl shadow-md text-sm transition-all"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
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

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={"flex items-center gap-2 flex-1 justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all " +
                    (activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Antécédents */}
        
            {activeTab === 'apercu' && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-4">Informations patient</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Nom:</span> <span className="font-semibold ml-2">{selected?.nom} {selected?.prenom}</span></div>
                    <div><span className="text-gray-500">CIN:</span> <span className="font-semibold ml-2">{selected?.cin}</span></div>
                    <div><span className="text-gray-500">Naissance:</span> <span className="font-semibold ml-2">{selected?.dateNaissance}</span></div>
                    <div><span className="text-gray-500">Groupe sanguin:</span> <span className="font-semibold ml-2">{selected?.groupeSanguin || 'Non renseigne'}</span></div>
                    <div><span className="text-gray-500">Tel:</span> <span className="font-semibold ml-2">{selected?.telephone}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-semibold ml-2">{selected?.email}</span></div>
                  </div>
                </div>
                {dossier?.antecedents?.find(a => a.source === 'ALLERGIES_LIBRES') && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <h3 className="font-semibold text-orange-700 mb-2">Allergies</h3>
                    <p className="text-sm text-orange-900 whitespace-pre-wrap">{dossier.antecedents.find(a => a.source === 'ALLERGIES_LIBRES').description}</p>
                  </div>
                )}
                {dossier?.antecedents?.find(a => a.source === 'TRAITEMENTS_EN_COURS') && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                    <h3 className="font-semibold text-purple-700 mb-2">Traitements en cours</h3>
                    <p className="text-sm text-purple-900 whitespace-pre-wrap">{dossier.antecedents.find(a => a.source === 'TRAITEMENTS_EN_COURS').description}</p>
                  </div>
                )}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">Antecedents ({(dossier?.antecedents || []).filter(a => !a.source).length})</h3>
                  {!(dossier?.antecedents || []).filter(a => !a.source).length ? (
                    <p className="text-gray-400 text-sm">Aucun antecedent</p>
                  ) : (dossier.antecedents.filter(a => !a.source).map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-700">{a.typeAntecedent}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.description}</p>
                        {a.dateDiagnostic && <p className="text-xs text-gray-400 mt-0.5">{a.dateDiagnostic}</p>}
                        {a.severite && <p className="text-xs text-orange-500 mt-0.5">{a.severite}</p>}
                      </div>
                      <span className={"text-xs px-2 py-0.5 rounded-full " + (a.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{a.actif ? "Actif" : "Inactif"}</span>
                    </div>
                  )))}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">Consultations ({dossier?.consultations?.length || 0})</h3>
                  {!dossier?.consultations?.length ? <p className="text-gray-400 text-sm">Aucune consultation</p>
                  : dossier.consultations.map((c, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500">{c.dateConsultation?.substring(0,10)}</span>
                        <span className="text-xs text-blue-600">{c.medecinNomComplet || ''}</span>
                      </div>
                      {c.motif && <p className="text-sm"><span className="font-medium">Motif:</span> {c.motif}</p>}
                      {c.diagnostic && <p className="text-sm mt-1"><span className="font-medium">Diagnostic:</span> {c.diagnostic}</p>}
                      {c.traitement && <p className="text-sm mt-1"><span className="font-medium">Traitement:</span> {c.traitement}</p>}
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">Ordonnances ({dossier?.ordonnances?.length || 0})</h3>
                  {!dossier?.ordonnances?.length ? <p className="text-gray-400 text-sm">Aucune ordonnance</p>
                  : dossier.ordonnances.map((o, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl mb-2">
                      <p className="text-xs text-gray-400">{o.dateOrdonnance?.substring(0,10)} - {o.typeOrdonnance}</p>
                      {o.lignes?.map((l, j) => <p key={j} className="text-sm mt-1 font-medium">{l.medicament} {l.dosage && "- " + l.dosage}</p>)}
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">Analyses ({dossier?.analyses?.length || 0})</h3>
                  {!dossier?.analyses?.length ? <p className="text-gray-400 text-sm">Aucune analyse</p>
                  : dossier.analyses.map((a, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl flex justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{a.typeAnalyse}</p>
                        <p className="text-xs text-gray-400">{a.dateAnalyse} - {a.laboratoire}</p>
                      </div>
                      <span className={"text-xs px-2 py-1 rounded-full " + (a.statut === "TERMINE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>{a.statut}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
    {activeTab === 'antecedents' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Antecedents medicaux</h3>
                  <button
                    onClick={addAntecedent}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                {form.antecedents.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">Aucun antecedent enregistre</p>
                )}
                {form.antecedents.map((ant, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Antecedent {i + 1}</span>
                      <button onClick={() => removeAntecedent(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <select
                          value={ant.typeAntecedent}
                          onChange={e => updateAntecedent(i, 'typeAntecedent', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        >
                          {TYPES_ANTECEDENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Severite</label>
                        <select
                          value={ant.severite}
                          onChange={e => updateAntecedent(i, 'severite', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        >
                          <option value="">-- Aucune --</option>
                          {SEVERITES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date diagnostic</label>
                        <input
                          type="date"
                          value={ant.dateDiagnostic || ''}
                          onChange={e => updateAntecedent(i, 'dateDiagnostic', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id={"actif-" + i}
                          checked={ant.actif}
                          onChange={e => updateAntecedent(i, 'actif', e.target.checked)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <label htmlFor={"actif-" + i} className="text-sm text-gray-600">Actif</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <textarea
                        value={ant.description}
                        onChange={e => updateAntecedent(i, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
                        placeholder="Description de l'antecedent..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Allergies */}
            {activeTab === 'allergies' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-700">Allergies connues</h3>
                </div>
                <textarea
                  value={form.allergies}
                  onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                  rows={8}
                  placeholder="Ex: Penicilline - reaction cutanee severe&#10;Aspirine - intolerance&#10;Latex - allergie de contact..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Tab: Traitements */}
            {activeTab === 'traitements' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-700">Traitements en cours</h3>
                </div>
                <textarea
                  value={form.traitementsEnCours}
                  onChange={e => setForm(f => ({ ...f, traitementsEnCours: e.target.value }))}
                  rows={8}
                  placeholder="Ex: Metformine 500mg - 2x/jour&#10;Amlodipine 5mg - 1x/jour au coucher&#10;Omeprazole 20mg - avant repas..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Tab: Observations */}
            {activeTab === 'observations' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-700">Observations generales</h3>
                </div>
                <textarea
                  value={form.observations}
                  onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                  rows={8}
                  placeholder="Notes cliniques, observations particulieres, informations importantes..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}