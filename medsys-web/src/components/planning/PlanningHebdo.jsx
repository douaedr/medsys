import { useState } from 'react'

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']
const JOURS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HEURES = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

const TYPE_COLORS = {
  CONSULTATION: 'bg-blue-100 border-blue-400 text-blue-800',
  CONTROLE:     'bg-orange-100 border-orange-400 text-orange-800',
  OPERATION:    'bg-red-100 border-red-400 text-red-800',
  BLOQUE:       'bg-gray-100 border-gray-400 text-gray-600',
}

export default function PlanningHebdo({ creneaux = [], readOnly = false, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null)

  const getCreneauxPourJour = (jour) =>
    creneaux.filter(c => c.jour === jour)

  return (
    <div className="w-full overflow-x-auto">
      {/* Légende */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(TYPE_COLORS).map(([type, cls]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded border ${cls}`} />
            <span className="text-xs text-slate-600 capitalize">{type.toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-8 gap-1 min-w-[700px]">
        {/* Header */}
        <div className="text-xs text-slate-400 font-semibold py-2 text-center">Heure</div>
        {JOURS_LABELS.map((j, i) => (
          <div key={i} className="text-xs font-semibold text-slate-700 text-center py-2 bg-slate-50 rounded-lg">
            {j}
          </div>
        ))}

        {/* Lignes horaires */}
        {HEURES.map(heure => (
          <>
            <div key={`h-${heure}`} className="text-xs text-slate-400 text-center py-3 border-t border-slate-100 flex items-start justify-center pt-2">
              {heure}
            </div>
            {JOURS.map((jour, ji) => {
              const creneauxSlot = getCreneauxPourJour(jour).filter(c => {
                const debut = c.heureDebut?.substring(0, 5)
                return debut === heure
              })
              return (
                <div key={`${jour}-${heure}`} className="border-t border-slate-100 min-h-[48px] relative p-0.5">
                  {creneauxSlot.map(c => (
                    <div
                      key={c.id}
                      className={`rounded border text-xs p-1 mb-0.5 cursor-default relative group ${TYPE_COLORS[c.type] || TYPE_COLORS.BLOQUE}`}
                      onMouseEnter={() => setHoveredId(c.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="font-semibold truncate">{c.type}</div>
                      <div className="truncate opacity-75">{c.heureDebut?.substring(0,5)}–{c.heureFin?.substring(0,5)}</div>
                      {c.medecinNom && <div className="truncate opacity-75 text-[10px]">{c.medecinNom}</div>}
                      {!readOnly && onDelete && (
                        <button
                          onClick={() => onDelete(c.id)}
                          className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 font-bold leading-none"
                          title="Supprimer"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        ))}
      </div>

      {creneaux.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          Aucun créneau planifié
        </div>
      )}
    </div>
  )
}
