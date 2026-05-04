import { useState } from 'react'

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']
const JOURS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const TYPE_COLORS = {
  CONSULTATION: { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af' },
  CONTROLE:     { bg: '#ffedd5', border: '#fb923c', text: '#9a3412' },
  OPERATION:    { bg: '#fee2e2', border: '#f87171', text: '#991b1b' },
  GARDE:        { bg: '#d1fae5', border: '#34d399', text: '#065f46' },
  BLOQUE:       { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
}

const TYPE_LABELS = {
  CONSULTATION: 'Consultation',
  CONTROLE:     'Contrôle',
  OPERATION:    'Opération',
  GARDE:        'Garde',
  BLOQUE:       'Bloqué',
}

const normaliseHeure = (h) => {
  if (h === null || h === undefined) return null
  if (Array.isArray(h)) {
    return `${String(h[0]??0).padStart(2,'0')}:${String(h[1]??0).padStart(2,'0')}:00`
  }
  if (typeof h === 'string') return h.length === 5 ? h + ':00' : h
  return null
}

const HEURE_DEBUT = 8
const HEURE_FIN   = 18
const SLOT_H      = 28
const HEADER_H    = 32

const heureToMinutes = (heure) => {
  const str = normaliseHeure(heure)
  if (!str) return 0
  const [h, m] = str.substring(0, 5).split(':').map(Number)
  return (h - HEURE_DEBUT) * 60 + m
}

const totalMinutes = (HEURE_FIN - HEURE_DEBUT) * 60
const totalH = (totalMinutes / 30) * SLOT_H

const HEURES = Array.from(
  { length: HEURE_FIN - HEURE_DEBUT + 1 },
  (_, i) => `${String(i + HEURE_DEBUT).padStart(2, '0')}:00`
)

export default function PlanningHebdo({ creneaux = [], readOnly = false, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null)

  const getCreneauxPourJour = (jour) => creneaux.filter(c => c.jour === jour)

  return (
    <div style={{ width: '100%', overflowX: 'auto', fontFamily: 'inherit' }}>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(TYPE_COLORS).map(([type, c]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1.5px solid ${c.border}` }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{TYPE_LABELS[type] || type}</span>
          </div>
        ))}
      </div>

      {/* Conteneur grille */}
      <div style={{ minWidth: 700, marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>

        {/* Header jours — FIXE en dehors de la zone scrollable */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, 1fr)',
          borderBottom: '2px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <div style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
            Heure
          </div>
          {JOURS_LABELS.map((j, i) => (
            <div key={i} style={{
              padding: '8px 0',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#334155',
              borderLeft: '1px solid #e2e8f0',
            }}>{j}</div>
          ))}
        </div>

        {/* Corps scrollable */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, 1fr)',
          position: 'relative',
        }}>

          {/* Colonne heures */}
          <div style={{ position: 'relative', height: totalH }}>
            {HEURES.map((heure, i) => (
              <div key={heure} style={{
                position: 'absolute',
                top: i * 2 * SLOT_H - 8,
                right: 6,
                fontSize: 11,
                color: '#94a3b8',
                userSelect: 'none',
              }}>{heure}</div>
            ))}
            {/* Lignes horizontales */}
            {Array.from({ length: (HEURE_FIN - HEURE_DEBUT) * 2 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: i * SLOT_H,
                left: 0, right: 0,
                borderTop: i % 2 === 0 ? '1px solid #e2e8f0' : '1px solid #f8fafc',
              }} />
            ))}
          </div>

          {/* 7 colonnes jours */}
          {JOURS.map((jour) => {
            const creneauxJour = getCreneauxPourJour(jour)
            return (
              <div key={jour} style={{
                position: 'relative',
                height: totalH,
                borderLeft: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}>
                {/* Lignes de fond */}
                {Array.from({ length: (HEURE_FIN - HEURE_DEBUT) * 2 }, (_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    top: i * SLOT_H,
                    left: 0, right: 0,
                    borderTop: i % 2 === 0 ? '1px solid #e2e8f0' : '1px solid #f8fafc',
                  }} />
                ))}

                {/* Créneaux */}
                {creneauxJour.map(c => {
                  const hD = normaliseHeure(c.heureDebut)
                  const hF = normaliseHeure(c.heureFin)
                  const startMin = heureToMinutes(hD)
                  const endMin   = heureToMinutes(hF)
                  const top    = (startMin / 30) * SLOT_H + 2
                  const height = ((endMin - startMin) / 30) * SLOT_H - 4
                  const colors = TYPE_COLORS[c.type] || TYPE_COLORS.BLOQUE

                  return (
                    <div
                      key={c.id}
                      onMouseEnter={() => setHoveredId(c.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        position: 'absolute',
                        top: Math.max(0, top),
                        left: 2, right: 2,
                        height: Math.max(20, height),
                        background: colors.bg,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: 6,
                        padding: '3px 6px',
                        fontSize: 11,
                        color: colors.text,
                        overflow: 'hidden',
                        cursor: 'default',
                        zIndex: 10,
                        boxShadow: hoveredId === c.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                        transition: 'box-shadow 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {TYPE_LABELS[c.type] || c.type}
                      </div>
                      <div style={{ opacity: 0.75 }}>
                        {hD?.substring(0,5)}–{hF?.substring(0,5)}
                      </div>
                      {c.medecinNom && (
                        <div style={{ fontSize: 10, opacity: 0.65 }}>{c.medecinNom}</div>
                      )}
                      {!readOnly && onDelete && hoveredId === c.id && (
                        <button
                          onClick={() => onDelete(c.id)}
                          style={{
                            position: 'absolute', top: 2, right: 4,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#ef4444', fontWeight: 'bold', fontSize: 14,
                          }}
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
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>
          Aucun créneau planifié
        </div>
      )}
    </div>
  )
}

