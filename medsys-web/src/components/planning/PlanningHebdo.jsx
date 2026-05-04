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

const heureToIndex = (heure) => {
  if (!heure) return 0
  const [h, m] = heure.substring(0, 5).split(':').map(Number)
  return (h - 8) * 2 + Math.floor(m / 30)
}

const calcSpan = (heureDebut, heureFin) => {
  const debut = heureToIndex(heureDebut)
  const fin = heureToIndex(heureFin)
  return Math.max(1, fin - debut)
}

export default function PlanningHebdo({ creneaux = [], readOnly = false, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null)

  // Nombre de demi-heures : 8h→18h = 20 slots
  const SLOTS = Array.from({ length: 20 }, (_, i) => {
    const h = 8 + Math.floor(i / 2)
    const m = i % 2 === 0 ? '00' : '30'
    return `${h.toString().padStart(2, '0')}:${m}`
  })

  const getCreneauxPourJour = (jour) => creneaux.filter(c => c.jour === jour)

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
      <div className="min-w-[700px]">
        {/* Header jours */}
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div className="text-xs text-slate-400 font-semibold py-2 text-center">Heure</div>
          {JOURS_LABELS.map((j, i) => (
            <div key={i} className="text-xs font-semibold text-slate-700 text-center py-2 bg-slate-50 rounded-lg">
              {j}
            </div>
          ))}
        </div>

        {/* Corps : colonne heure + 7 colonnes jours */}
        <div className="grid grid-cols-8 gap-1">
          {/* Colonne heures */}
          <div className="grid" style={{ gridTemplateRows: `repeat(${SLOTS.length}, 24px)` }}>
            {SLOTS.map((slot, i) => (
              <div key={slot} className="text-xs text-slate-400 text-center flex items-center justify-center border-t border-slate-100" style={{ height: 24 }}>
                {slot.endsWith(':00') ? slot : ''}
              </div>
            ))}
          </div>

          {/* Colonnes jours */}
          {JOURS.map((jour) => {
            const creneauxJour = getCreneauxPourJour(jour)
            return (
              <div
                key={jour}
                className="relative border-l border-slate-100"
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${SLOTS.length}, 24px)`,
                  minHeight: SLOTS.length * 24,
                }}
              >
                {/* Lignes de fond */}
                {SLOTS.map((slot, i) => (
                  <div
                    key={slot}
                    className={`border-t ${i % 2 === 0 ? 'border-slate-200' : 'border-slate-100'}`}
                    style={{ gridRow: i + 1, gridColumn: 1 }}
                  />
                ))}

                {/* Créneaux */}
                {creneauxJour.map(c => {
                  const rowStart = heureToIndex(c.heureDebut) + 1
                  const span = calcSpan(c.heureDebut, c.heureFin)
                  return (
                    <div
                      key={c.id}
                      className={`rounded border text-xs p-1 cursor-default relative group z-10 overflow-hidden ${TYPE_COLORS[c.type] || TYPE_COLORS.BLOQUE}`}
                      style={{
                        gridRow: `${rowStart} / span ${span}`,
                        gridColumn: 1,
                        margin: '1px 2px',
                      }}
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
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {creneaux.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          Aucun créneau planifié
        </div>
      )}
    </div>
  )
}
