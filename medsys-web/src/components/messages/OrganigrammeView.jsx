import { useEffect, useState } from 'react'
import { directeurApi } from '../../api/api'
import { Crown, Stethoscope, ClipboardList, Heart, Network, List, Search } from 'lucide-react'
import LoadingState from '../shared/LoadingState'
import EmptyState from '../shared/EmptyState'
import { cn } from '../../lib/utils'

/**
 * FEAT 5 — Vue arbre / liste filtrable de l'organigramme.
 * Réutilisable dans DirecteurDashboard et ChefServiceDashboard.
 */
export default function OrganigrammeView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('arbre') // 'arbre' | 'liste'
  const [search, setSearch] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await directeurApi.organigramme()
        setData(res.data)
      } catch (err) {
        console.error('Erreur organigramme:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <EmptyState icon={Network} title="Organigramme indisponible" description="Impossible de charger l'organigramme." />

  // Construire la liste à plat pour la vue liste
  const flatten = () => {
    const list = []
    if (data.directeur) list.push({ ...data.directeur, contexte: 'Direction' })
    data.services?.forEach(svc => {
      if (svc.chef) list.push({ ...svc.chef, contexte: `Chef de ${svc.nom}` })
      svc.medecins?.forEach(m => list.push({ ...m, contexte: `Médecin · ${svc.nom}` }))
      svc.secretaires?.forEach(s => list.push({ ...s, contexte: `Secrétaire · ${svc.nom}` }))
      svc.infirmiers?.forEach(i => list.push({ ...i, contexte: `Infirmier · ${svc.nom}` }))
    })
    return list
  }

  const flatList = flatten().filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (p.nom || '').toLowerCase().includes(q)
        || (p.prenom || '').toLowerCase().includes(q)
        || (p.role || '').toLowerCase().includes(q)
        || (p.contexte || '').toLowerCase().includes(q)
        || (p.email || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setView('arbre')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              view === 'arbre' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Network className="w-4 h-4" /> Arbre
          </button>
          <button
            onClick={() => setView('liste')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              view === 'liste' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <List className="w-4 h-4" /> Liste
          </button>
        </div>
        {view === 'liste' && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher (nom, rôle, service)…"
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:bg-white w-72"
            />
          </div>
        )}
      </div>

      {/* Vue arbre */}
      {view === 'arbre' && (
        <div className="space-y-6">
          {/* Directeur */}
          {data.directeur && (
            <div className="flex justify-center">
              <PersonCard person={data.directeur} variant="directeur" />
            </div>
          )}

          {/* Trait vertical */}
          {data.directeur && data.services?.length > 0 && (
            <div className="flex justify-center">
              <div className="w-px h-8 bg-slate-300"></div>
            </div>
          )}

          {/* Services */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services?.map(svc => (
              <ServiceCard key={svc.id} service={svc} />
            ))}
          </div>
        </div>
      )}

      {/* Vue liste */}
      {view === 'liste' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Personne</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Affectation</th>
                <th className="px-6 py-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flatList.map((p, i) => (
                <tr key={`${p.id}-${i}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {(p.prenom?.[0] || '') + (p.nom?.[0] || '')}
                      </div>
                      <div className="font-semibold text-sm text-slate-900">{p.prenom} {p.nom}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-600 font-semibold uppercase">{p.role}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{p.contexte}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{p.email || '—'}</td>
                </tr>
              ))}
              {flatList.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Aucun résultat</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PersonCard({ person, variant = 'default' }) {
  const colors = {
    directeur: 'from-purple-500 to-indigo-700 border-purple-400',
    chef: 'from-amber-500 to-orange-600 border-amber-400',
    medecin: 'from-blue-500 to-blue-700 border-blue-400',
    secretaire: 'from-pink-500 to-rose-600 border-pink-400',
    personnel: 'from-emerald-500 to-teal-600 border-emerald-400',
    default: 'from-slate-400 to-slate-600 border-slate-400',
  }
  const Icon = {
    directeur: Crown,
    chef: Crown,
    medecin: Stethoscope,
    secretaire: ClipboardList,
    personnel: Heart,
    default: Stethoscope,
  }[variant] || Stethoscope

  return (
    <div className={cn(
      'relative px-4 py-3 rounded-xl bg-gradient-to-br text-white shadow-md min-w-[220px] border-2',
      colors[variant] || colors.default
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{person.role}</span>
      </div>
      <div className="font-bold text-sm">{person.prenom} {person.nom}</div>
      {person.email && <div className="text-[11px] opacity-80 truncate">{person.email}</div>}
    </div>
  )
}

function ServiceCard({ service }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="border-b border-slate-100 pb-2">
        <h4 className="font-bold text-slate-900">{service.nom}</h4>
        <p className="text-xs text-slate-500">
          {service.code && <span className="font-mono mr-2">{service.code}</span>}
          {service.localisation}
        </p>
      </div>

      {service.chef && (
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Chef de service</div>
          <PersonCard person={service.chef} variant="chef" />
        </div>
      )}

      {service.medecins?.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Médecins ({service.medecins.length})</div>
          <div className="space-y-1">
            {service.medecins.map(m => (
              <div key={m.id} className="text-sm flex items-center gap-2 px-2 py-1 rounded bg-blue-50">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">Dr. {m.prenom} {m.nom}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {service.secretaires?.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Secrétaires ({service.secretaires.length})</div>
          <div className="space-y-1">
            {service.secretaires.map(s => (
              <div key={s.id} className="text-sm flex items-center gap-2 px-2 py-1 rounded bg-pink-50">
                <ClipboardList className="w-3.5 h-3.5 text-pink-600" />
                <span className="text-slate-700">{s.prenom} {s.nom}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {service.infirmiers?.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Personnel soignant ({service.infirmiers.length})</div>
          <div className="space-y-1">
            {service.infirmiers.map(i => (
              <div key={i.id} className="text-sm flex items-center gap-2 px-2 py-1 rounded bg-emerald-50">
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-700">{i.prenom} {i.nom}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
