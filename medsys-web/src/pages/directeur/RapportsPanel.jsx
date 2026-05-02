import { useState } from 'react'
import { directeurApi } from '../../api/api'
import { FileText, Calendar, Users, Stethoscope, Download } from 'lucide-react'

/**
 * FEAT 4 — Panneau de génération de rapports PDF.
 * Inséré dans l'onglet "rapports" du DirecteurDashboard.
 */
export default function RapportsPanel() {
  const [busy, setBusy] = useState(null)
  const today = new Date()
  const [mois, setMois] = useState(today.getMonth() + 1)
  const [annee, setAnnee] = useState(today.getFullYear())

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handle = async (key, fn, filename) => {
    setBusy(key)
    try {
      const res = await fn()
      downloadBlob(res.data, filename)
    } catch (err) {
      alert('Erreur lors de la génération du rapport : ' + (err.response?.data?.message || err.message))
    } finally {
      setBusy(null)
    }
  }

  const cards = [
    {
      key: 'mensuel',
      icon: Calendar,
      title: 'Rapport mensuel',
      desc: 'Statistiques de patients, consultations et RDV pour un mois donné.',
      color: 'from-blue-500 to-blue-700',
      action: (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="label">Mois</label>
            <select className="input" value={mois} onChange={e => setMois(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('fr-FR', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="label">Année</label>
            <input type="number" className="input" value={annee} onChange={e => setAnnee(parseInt(e.target.value))} />
          </div>
          <button
            onClick={() => handle('mensuel',
              () => directeurApi.rapportMensuel(mois, annee),
              `rapport-mensuel-${annee}-${String(mois).padStart(2,'0')}.pdf`
            )}
            disabled={busy === 'mensuel'}
            className="btn-primary"
          >
            {busy === 'mensuel' ? '…' : <><Download className="w-4 h-4" /> PDF</>}
          </button>
        </div>
      ),
    },
    {
      key: 'annuel',
      icon: FileText,
      title: 'Rapport annuel',
      desc: 'Indicateurs clés et répartition par service pour l\'année.',
      color: 'from-purple-500 to-purple-700',
      action: (
        <div className="flex gap-2 items-end">
          <div className="w-32">
            <label className="label">Année</label>
            <input type="number" className="input" value={annee} onChange={e => setAnnee(parseInt(e.target.value))} />
          </div>
          <button
            onClick={() => handle('annuel',
              () => directeurApi.rapportAnnuel(annee),
              `rapport-annuel-${annee}.pdf`
            )}
            disabled={busy === 'annuel'}
            className="btn-primary"
          >
            {busy === 'annuel' ? '…' : <><Download className="w-4 h-4" /> PDF</>}
          </button>
        </div>
      ),
    },
    {
      key: 'medecins',
      icon: Stethoscope,
      title: 'Activité des médecins',
      desc: 'Liste complète des médecins avec spécialité, service et matricule.',
      color: 'from-emerald-500 to-emerald-700',
      action: (
        <button
          onClick={() => handle('medecins', () => directeurApi.rapportMedecins(), 'stats-medecins.pdf')}
          disabled={busy === 'medecins'}
          className="btn-primary"
        >
          {busy === 'medecins' ? '…' : <><Download className="w-4 h-4" /> Télécharger</>}
        </button>
      ),
    },
    {
      key: 'patients',
      icon: Users,
      title: 'Liste des patients',
      desc: 'Annuaire complet des patients enregistrés (nom, CIN, contact).',
      color: 'from-amber-500 to-orange-600',
      action: (
        <button
          onClick={() => handle('patients', () => directeurApi.rapportPatients(), 'liste-patients.pdf')}
          disabled={busy === 'patients'}
          className="btn-primary"
        >
          {busy === 'patients' ? '…' : <><Download className="w-4 h-4" /> Télécharger</>}
        </button>
      ),
    },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {cards.map(c => (
        <div key={c.key} className="card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{c.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{c.desc}</p>
            </div>
          </div>
          {c.action}
        </div>
      ))}
    </div>
  )
}
