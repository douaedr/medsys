import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:8081/api/chef'

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
const JOURS_FR = { LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi', JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi' }
const ACTIVITES = ['CONSULTATION', 'GARDE', 'REUNION', 'REPOS', 'AUTRE']
const HEURES = Array.from({ length: 29 }, (_, i) => {
  const h = 6 + Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  if (h > 20) return null
  return `${String(h).padStart(2, '0')}:${m}`
}).filter(Boolean)

function toMins(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function duree(d, f) {
  const m = toMins(f) - toMins(d)
  if (m <= 0) return ''
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}
function actColor(a) {
  return { CONSULTATION: '#0ea5e9', GARDE: '#dc2626', REUNION: '#8b5cf6', REPOS: '#10b981', AUTRE: '#64748b' }[a] || '#64748b'
}

export default function GestionEmploiDuTemps() {
  const { user, token } = useAuth()
  const chefId = user?.personnelId || user?.id

  const [personnel, setPersonnel] = useState([])
  const [selected, setSelected] = useState(null)
  const [plannings, setPlannings] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Chef-Id': String(chefId),
    'Content-Type': 'application/json'
  }

  // Charger personnel depuis user_accounts via auth
  useEffect(() => {
    fetch('http://localhost:8081/api/v1/chef/medecins', { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setPersonnel(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => {
        // fallback: charger les plannings du chef
        fetch(`${API}/edt/chef/${chefId}`, { headers })
          .then(r => r.ok ? r.json() : [])
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              const ids = [...new Set(data.map(p => p.personnelId))]
              const fakePersonnel = ids.map(id => ({ id, email: `Personnel #${id}`, role: 'PERSONNEL' }))
              setPersonnel(fakePersonnel)
              setSelected(fakePersonnel[0])
            }
          })
      })
  }, [])

  useEffect(() => {
    if (!selected) return
    const pid = selected.personnelId || selected.id
    fetch(`${API}/edt/personnel/${pid}`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPlannings(Array.isArray(data) ? data : []))
      .catch(() => setPlannings([]))
  }, [selected])

  function getParJour(jour) {
    return plannings.filter(p => p.jourSemaine === jour)
  }

  function ouvrirModal(jour, item = null) {
    setEditData({
      id: item?.id || null,
      jour,
      heureDebut: item?.heureDebut?.substring(0, 5) || '08:00',
      heureFin: item?.heureFin?.substring(0, 5) || '17:00',
      activite: item?.activite || 'CONSULTATION',
      salle: item?.salle || ''
    })
    setModalOpen(true)
  }

  async function sauvegarder() {
    if (toMins(editData.heureFin) <= toMins(editData.heureDebut)) {
      setAlert({ type: 'error', message: "L'heure de fin doit être après l'heure de début." })
      return
    }
    setLoading(true)
    const pid = selected?.personnelId || selected?.id
    const body = {
      personnelId: pid,
      serviceId: 'CARDIO',
      jourSemaine: editData.jour,
      heureDebut: editData.heureDebut + ':00',
      heureFin: editData.heureFin + ':00',
      activite: editData.activite,
      salle: editData.salle || null
    }
    try {
      const url = editData.id ? `${API}/edt/${editData.id}` : `${API}/edt`
      const method = editData.id ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (r.ok) {
        setAlert({ type: 'success', message: 'Créneau enregistré !' })
        setModalOpen(false)
        // recharger
        const pid2 = selected?.personnelId || selected?.id
        const res = await fetch(`${API}/edt/personnel/${pid2}`, { headers })
        if (res.ok) setPlannings(await res.json())
      } else {
        const err = await r.text()
        setAlert({ type: 'error', message: err || 'Erreur.' })
      }
    } catch { setAlert({ type: 'error', message: 'Erreur réseau.' }) }
    setLoading(false)
  }

  async function supprimer(id) {
    if (!window.confirm('Supprimer ce créneau ?')) return
    const r = await fetch(`${API}/edt/${id}`, { method: 'DELETE', headers })
    if (r.ok) {
      setPlannings(p => p.filter(x => x.id !== id))
      setAlert({ type: 'success', message: 'Créneau supprimé.' })
    }
  }

  const roleLabel = r => ({ MEDECIN: 'Médecin', PERSONNEL: 'Personnel', SECRETARY: 'Secrétaire', NURSE: 'Infirmier(e)' }[r] || r)
  const roleColor = r => ({ MEDECIN: '#0ea5e9', PERSONNEL: '#10b981', SECRETARY: '#f59e0b', NURSE: '#10b981' }[r] || '#64748b')

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {alert && (
        <div style={{
          background: alert.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${alert.type === 'success' ? '#86efac' : '#fca5a5'}`,
          borderRadius: 8, padding: '12px 16px', display: 'flex',
          justifyContent: 'space-between', marginBottom: 16
        }}>
          <span style={{ color: alert.type === 'success' ? '#15803d' : '#dc2626', fontSize: 14 }}>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Liste personnel */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, width: 220, flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Personnel</div>
          {personnel.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Chargement...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {personnel.map(p => {
                const pid = p.personnelId || p.id
                const spid = selected?.personnelId || selected?.id
                const isSelected = pid === spid
                return (
                  <button key={p.id} onClick={() => setSelected(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, border: 'none',
                    background: isSelected ? '#f0f9ff' : 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                    borderLeft: isSelected ? `3px solid ${roleColor(p.role)}` : '3px solid transparent'
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: roleColor(p.role) + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: roleColor(p.role), flexShrink: 0
                    }}>
                      {(p.prenom?.[0] || p.email?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                        {p.prenom && p.nom ? `${p.prenom} ${p.nom}` : p.email}
                      </div>
                      <div style={{ fontSize: 11, color: roleColor(p.role) }}>{roleLabel(p.role)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Grille */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
            padding: '14px 20px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                {selected ? (selected.prenom && selected.nom ? `${selected.prenom} ${selected.nom}` : selected.email) : 'Sélectionnez un membre'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Planning hebdomadaire récurrent</div>
            </div>
            {selected && (
              <button onClick={() => ouvrirModal('LUNDI')} style={{
                padding: '8px 16px', border: 'none', borderRadius: 8,
                background: '#0ea5e9', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500
              }}>+ Nouveau créneau</button>
            )}
          </div>

          {!selected ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              Sélectionnez un membre du personnel.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {JOURS.map(jour => {
                const items = getParJour(jour)
                return (
                  <div key={jour} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 8px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{JOURS_FR[jour]}</div>
                    </div>
                    <div style={{ padding: 8, minHeight: 100 }}>
                      {items.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: 12 }}>
                          <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 6 }}>Libre</div>
                          <button onClick={() => ouvrirModal(jour)} style={{
                            fontSize: 11, padding: '4px 8px', border: '1px dashed #cbd5e1',
                            borderRadius: 6, background: 'none', color: '#94a3b8', cursor: 'pointer'
                          }}>+ Ajouter</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {items.map(item => (
                            <div key={item.id} style={{
                              background: actColor(item.activite) + '10',
                              border: `1px solid ${actColor(item.activite)}30`,
                              borderRadius: 8, padding: '6px 8px'
                            }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: actColor(item.activite) }}>{item.activite}</div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>
                                {item.heureDebut?.substring(0, 5)} – {item.heureFin?.substring(0, 5)}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{duree(item.heureDebut, item.heureFin)}</div>
                              {item.salle && <div style={{ fontSize: 10, color: '#94a3b8' }}>Salle: {item.salle}</div>}
                              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                                <button onClick={() => ouvrirModal(jour, item)} style={{
                                  fontSize: 10, padding: '2px 6px',
                                  border: `1px solid ${actColor(item.activite)}`,
                                  borderRadius: 4, background: 'none', color: actColor(item.activite), cursor: 'pointer'
                                }}>Modifier</button>
                                <button onClick={() => supprimer(item.id)} style={{
                                  fontSize: 10, padding: '2px 6px', border: '1px solid #fca5a5',
                                  borderRadius: 4, background: 'none', color: '#dc2626', cursor: 'pointer'
                                }}>×</button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => ouvrirModal(jour)} style={{
                            fontSize: 11, padding: '3px', border: '1px dashed #cbd5e1',
                            borderRadius: 6, background: 'none', color: '#94a3b8', cursor: 'pointer'
                          }}>+ Ajouter</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {plannings.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginTop: 12, display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Créneaux total</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{plannings.length}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Heures/semaine</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0ea5e9' }}>
                  {(() => {
                    const total = plannings.reduce((acc, p) => acc + toMins(p.heureFin) - toMins(p.heureDebut), 0)
                    return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}`
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#0f172a' }}>
                {editData?.id ? 'Modifier' : 'Nouveau créneau'} — {JOURS_FR[editData?.jour]}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Jour</label>
                <select value={editData?.jour} onChange={e => setEditData(d => ({ ...d, jour: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                  {JOURS.map(j => <option key={j} value={j}>{JOURS_FR[j]}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Heure début</label>
                  <select value={editData?.heureDebut} onChange={e => setEditData(d => ({ ...d, heureDebut: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                    {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Heure fin</label>
                  <select value={editData?.heureFin} onChange={e => setEditData(d => ({ ...d, heureFin: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                    {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {editData?.heureDebut && editData?.heureFin && toMins(editData.heureFin) > toMins(editData.heureDebut) && (
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#15803d' }}>
                  Durée : {duree(editData.heureDebut, editData.heureFin)}
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Activité</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {ACTIVITES.map(a => (
                    <button key={a} onClick={() => setEditData(d => ({ ...d, activite: a }))} style={{
                      padding: '6px 8px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                      border: `1px solid ${editData?.activite === a ? actColor(a) : '#e2e8f0'}`,
                      background: editData?.activite === a ? actColor(a) + '15' : '#fff',
                      color: editData?.activite === a ? actColor(a) : '#374151',
                      fontWeight: editData?.activite === a ? 600 : 400
                    }}>{a}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Salle (optionnel)</label>
                <input value={editData?.salle || ''} onChange={e => setEditData(d => ({ ...d, salle: e.target.value }))}
                  placeholder="Ex: Salle 12, Bloc A..."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setModalOpen(false)} style={{
                  padding: '8px 20px', border: '1px solid #e2e8f0', borderRadius: 8,
                  background: 'none', color: '#374151', cursor: 'pointer', fontSize: 14
                }}>Annuler</button>
                <button onClick={sauvegarder} disabled={loading} style={{
                  padding: '8px 24px', border: 'none', borderRadius: 8,
                  background: '#0ea5e9', color: '#fff', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, opacity: loading ? 0.7 : 1
                }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
