import { useEffect, useState } from 'react'
import { directeurApi } from '../../api/api'
import { Users, Calendar, Stethoscope, Activity, TrendingUp } from 'lucide-react'

// Composant barre simple sans librairie externe
function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-28 text-xs text-slate-600 text-right truncate">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-5 rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${color}`}
          style={{ width: `${pct}%` }}
        >
          {pct > 15 && <span className="text-[10px] font-bold text-white">{value}</span>}
        </div>
      </div>
      {pct <= 15 && <span className="text-xs font-bold text-slate-700 w-6">{value}</span>}
    </div>
  )
}

// Composant donut simple SVG
function Donut({ segments, size = 120 }) {
  const r = 45
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0
        const dash = pct * circumference
        const gap = circumference - dash
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        )
        offset += pct
        return el
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold" fontSize="16" fill="#1e293b">
        {total}
      </text>
    </svg>
  )
}

export default function StatsGraphiques() {
  const [stats, setStats]     = useState(null)
  const [medecins, setMedecins] = useState([])
  const [rdv, setRdv]         = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      directeurApi.stats().catch(() => ({ data: null })),
      directeurApi.medecins().catch(() => ({ data: [] })),
      directeurApi.rdv({}).catch(() => ({ data: [] })),
    ]).then(([s, m, r]) => {
      setStats(s.data)
      setMedecins(m.data || [])
      setRdv(r.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-12 text-center text-slate-400 text-sm">Chargement des statistiques…</div>

  // Répartition RDV par statut
  const rdvStatuts = rdv.reduce((acc, r) => {
    const s = r.statut || 'EN_ATTENTE'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  const donutSegments = [
    { label: 'En attente', value: rdvStatuts['EN_ATTENTE'] || 0, color: '#3b82f6' },
    { label: 'Terminé',    value: rdvStatuts['TERMINE'] || 0,    color: '#10b981' },
    { label: 'Annulé',     value: rdvStatuts['ANNULE'] || 0,     color: '#ef4444' },
  ]

  // Médecins par spécialité
  const parSpec = medecins.reduce((acc, m) => {
    const s = m.specialite || 'Autre'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})
  const maxSpec = Math.max(...Object.values(parSpec), 1)

  // Médecins par service
  const parService = medecins.reduce((acc, m) => {
    const s = m.service || 'Non assigné'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})
  const maxService = Math.max(...Object.values(parService), 1)

  const SPEC_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-500']
  const SVC_COLORS  = ['bg-indigo-500', 'bg-teal-500', 'bg-amber-500', 'bg-pink-500', 'bg-lime-500']

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Patients',      value: stats?.totalPatients ?? '—',      icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'RDV total',     value: stats?.totalRdv ?? rdv.length,    icon: Calendar,    color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Médecins',      value: stats?.totalMedecins ?? medecins.length, icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Consultations', value: stats?.totalConsultations ?? '—', icon: Activity,    color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((k, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${k.bg} flex items-center justify-center`}>
              <k.icon className={`w-6 h-6 ${k.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Donut RDV par statut */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-600" /> Répartition des RDV
          </h3>
          {rdv.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucun rendez-vous</p>
          ) : (
            <div className="flex items-center gap-8 justify-center">
              <Donut segments={donutSegments} size={140} />
              <div className="space-y-2">
                {donutSegments.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-600">{s.label}</span>
                    <span className="font-bold text-slate-900 ml-auto pl-4">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Barres médecins par spécialité */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" /> Médecins par spécialité
          </h3>
          {Object.keys(parSpec).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucun médecin</p>
          ) : (
            <div className="mt-2">
              {Object.entries(parSpec).map(([spec, count], i) => (
                <Bar key={spec} label={spec} value={count} max={maxSpec} color={SPEC_COLORS[i % SPEC_COLORS.length]} />
              ))}
            </div>
          )}
        </div>

        {/* Barres médecins par service */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Médecins par service
          </h3>
          {Object.keys(parService).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
          ) : (
            <div className="mt-2">
              {Object.entries(parService).map(([svc, count], i) => (
                <Bar key={svc} label={svc} value={count} max={maxService} color={SVC_COLORS[i % SVC_COLORS.length]} />
              ))}
            </div>
          )}
        </div>

        {/* Derniers RDV */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" /> Activité récente
          </h3>
          {rdv.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucun rendez-vous</p>
          ) : (
            <div className="space-y-2">
              {rdv.slice(0, 6).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{r.medecinNom || r.doctorName || 'Médecin'}</div>
                    <div className="text-xs text-slate-500">{r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '—'}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    r.statut === 'ANNULE'  ? 'bg-red-100 text-red-700' :
                    r.statut === 'TERMINE' ? 'bg-slate-100 text-slate-600' :
                    'bg-blue-100 text-blue-700'
                  }`}>{r.statut || 'EN_ATTENTE'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
