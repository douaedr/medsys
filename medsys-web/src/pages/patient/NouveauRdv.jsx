import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const APPT_BASE = '/api'

const apptFetch = async (path, opts = {}) => {
  const token = sessionStorage.getItem('medsys_token')
  const res = await fetch(`${APPT_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || res.statusText)
  }
  return res.json()
}

const getIcon = (name) => {
  if (!name) return ''
  const n = name.toLowerCase()
  if (n.includes('cardio')) return '\u2764\uFE0F'
  if (n.includes('dermato')) return '\uD83D\uDD2C'
  if (n.includes('gyn')) return '\uD83C\uDF38'
  if (n.includes('rale') || n.includes('gene')) return '\uD83E\uDE7A'
  if (n.includes('neuro')) return '\uD83E\uDDE0'
  if (n.includes('ophta')) return '\uD83D\uDC41\uFE0F'
  if (n.includes('diatr')) return '\uD83D\uDC76'
  if (n.includes('rhumato')) return '\uD83E\uDDB4'
  if (n.includes('pneumo')) return '\uD83E\uDEB1'
  if (n.includes('gastro')) return '\uD83E\uDEB9'
  if (n.includes('sanguin') || n.includes('bilan')) return '\uD83E\uDDEA'
  if (n.includes('micro')) return '\uD83E\uDDA0'
  if (n.includes('hormonal')) return '\u2697\uFE0F'
  if (n.includes('radio')) return '\uD83D\uDCE1'
  if (n.includes('echo')) return '\uD83D\uDD0A'
  if (n.includes('scanner') || n.includes('tdm')) return '\uD83D\uDD2D'
  if (n.includes('irm')) return '\uD83E\uDDF2'
  return '\uD83C\uDFE5'
}

const CATEGORIES = [
  { key: 'consultation', label: 'Consultation médicale', icon: '\uD83E\uDE7A', desc: 'Choisissez une spécialité puis un médecin', color: '#3b82f6' },
  { key: 'analyses', label: 'Analyses médicales', icon: '\uD83E\uDDEA', desc: 'Bilan sanguin, urinaire, microbiologie…', color: '#8b5cf6' },
  { key: 'imagerie', label: 'Scanner & Radiologie', icon: '\uD83D\uDD2D', desc: 'IRM, scanner, radiographie, échographie…', color: '#06b6d4' },
]

const SERVICE_KEYWORDS = {
  consultation: ['cardio','dermato','gyn','medecine','neuro','ophta','diatr','rhumato','pneumo','gastro','generale','general'],
  analyses: ['sanguin','microbiologie','hormonal','bilan'],
  imagerie: ['radiographie','echographie','scanner','irm','tdm'],
}

const normalize = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const filterByCategory = (services, catKey) => {
  const kws = SERVICE_KEYWORDS[catKey] || []
  if (!kws.length) return services
  return services.filter(s => kws.some(k => normalize(s.name).includes(k)))
}

const getMondayOf = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const fmtTime = (dt) => new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const toISO = (date) => date.toISOString().split('T')[0]
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function NouveauRdv({ onBack, onSuccess }) {
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState(null)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [weekStart, setWeekStart] = useState(getMondayOf(new Date()))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apptFetch('/services')
      .then(data => setServices(data || []))
      .catch(() => setServices([]))
  }, [])

  useEffect(() => {
    if (!selectedService || category?.key !== 'consultation') return
    setDoctors([])
    apptFetch(`/services/${selectedService.id}/doctors`)
      .then(data => setDoctors(data || []))
      .catch(() => setDoctors([]))
  }, [selectedService, category])

  const loadSlots = useCallback(async () => {
    if (!selectedService) return
    setLoading(true)
    setError('')
    try {
      const ws = toISO(weekStart)
      let data
      if (category?.key === 'consultation' && selectedDoctor) {
        data = await apptFetch(`/slots/doctor/${selectedDoctor.id}/week?weekStart=${ws}`)
      } else {
        data = await apptFetch(`/slots/hospital/${selectedService.id}/week?weekStart=${ws}`)
      }
      setSlots((data || []).filter(s => s.status === 'Available'))
    } catch {
      setSlots([])
      setError('Impossible de charger les créneaux.')
    } finally {
      setLoading(false)
    }
  }, [selectedService, selectedDoctor, weekStart, category])

  useEffect(() => {
    if (step === 3) loadSlots()
  }, [step, loadSlots])

  const getPatientInfo = () => {
    try {
      const token = sessionStorage.getItem('medsys_token')
      if (!token) return { patientName: 'Patient', patientEmail: '' }
      const payload = JSON.parse(atob(token.split('.')[1]))
      const name = `${payload.prenom || ''} ${payload.nom || ''}`.trim() || 'Patient'
      const email = payload.sub || payload.email || ''
      return { patientName: name, patientEmail: email }
    } catch { return { patientName: 'Patient', patientEmail: '' } }
  }

  const handleBook = async () => {
    if (!selectedSlot) return
    setLoading(true)
    setError('')
    try {
      const { patientName, patientEmail } = getPatientInfo()
      await apptFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({ timeSlotId: selectedSlot.id, reason, patientName, patientEmail }),
      })
      setStep(5)
      setTimeout(() => onSuccess?.(), 2500)
    } catch (e) {
      setError(e.message || 'Erreur lors de la réservation.')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (step === 0) { onBack?.(); return }
    if (step === 1) { setSelectedService(null); setStep(0); return }
    if (step === 2) { setSelectedDoctor(null); setStep(1); return }
    if (step === 3) { setSelectedSlot(null); setStep(category?.key === 'consultation' ? 2 : 1); return }
    if (step === 4) { setStep(3); return }
    setStep(s => Math.max(0, s - 1))
  }

  const slotsByDay = () => {
    const map = {}
    for (let i = 0; i < 7; i++) {
      map[toISO(addDays(weekStart, i))] = []
    }
    slots.forEach(s => {
      const key = new Date(s.startTime).toISOString().split('T')[0]
      if (map[key] !== undefined) map[key].push(s)
    })
    return map
  }

  const stepLabels = category?.key === 'consultation'
    ? ['Catégorie', 'Spécialité', 'Médecin', 'Créneau', 'Confirmation']
    : ['Catégorie', 'Service', 'Créneau', 'Confirmation']

  const currentStepIndex = category?.key === 'consultation' ? step : step > 1 ? step - 1 : step

  if (step === 5) {
    return (
      <div style={styles.successWrap}>
        <div style={styles.successIcon}>&#9989;</div>
        <h2 style={styles.successTitle}>Rendez-vous confirmé !</h2>
        <p style={styles.successSub}>Votre réservation a été enregistrée.</p>
        {selectedSlot && (
          <div style={styles.successDetails}>
            <div style={styles.successRow}>&#128197; {new Date(selectedSlot.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style={styles.successRow}>&#128336; {fmtTime(selectedSlot.startTime)} &ndash; {fmtTime(selectedSlot.endTime)}</div>
            {selectedDoctor && <div style={styles.successRow}>&#128104;&#8205;&#9877;&#65039; Dr. {selectedDoctor.fullName}</div>}
            <div style={styles.successRow}>&#127973; {selectedService?.name}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <button onClick={goBack} style={styles.backBtn}><ArrowLeft size={18} /></button>
        <div>
          <h2 style={styles.headerTitle}>Nouveau rendez-vous</h2>
          <p style={styles.headerSub}>{stepLabels[currentStepIndex]} &mdash; étape {currentStepIndex + 1}/{stepLabels.length}</p>
        </div>
      </div>

      <div style={styles.stepperWrap}>
        {stepLabels.map((label, i) => (
          <div key={i} style={styles.stepperItem}>
            <div style={{
              ...styles.stepperDot,
              background: i < currentStepIndex ? '#10b981' : i === currentStepIndex ? '#3b82f6' : '#e2e8f0',
              color: i <= currentStepIndex ? '#fff' : '#94a3b8',
              boxShadow: i === currentStepIndex ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
            }}>
              {i < currentStepIndex ? '\u2713' : i + 1}
            </div>
            <span style={{ ...styles.stepperLabel, color: i === currentStepIndex ? '#3b82f6' : '#94a3b8', fontWeight: i === currentStepIndex ? 600 : 400 }}>
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div style={{ ...styles.stepperLine, background: i < currentStepIndex ? '#10b981' : '#e2e8f0' }} />
            )}
          </div>
        ))}
      </div>

      <div style={styles.content}>
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* ETAPE 0 - CATEGORIE */}
        {step === 0 && (
          <div>
            <h3 style={styles.sectionTitle}>Que souhaitez-vous réserver ?</h3>
            <p style={styles.sectionSub}>Choisissez le type de rendez-vous médical</p>
            <div style={styles.catGrid}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => { setCategory(cat); setStep(1) }}
                  style={{ ...styles.catCard, borderColor: cat.color + '33' }}>
                  <div style={{ ...styles.catIconWrap, background: cat.color + '15' }}>
                    <span style={styles.catIcon}>{cat.icon}</span>
                  </div>
                  <div style={styles.catInfo}>
                    <span style={styles.catLabel}>{cat.label}</span>
                    <span style={styles.catDesc}>{cat.desc}</span>
                  </div>
                  <ArrowRight size={16} color={cat.color} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ETAPE 1 - SERVICE */}
        {step === 1 && (
          <div>
            <h3 style={styles.sectionTitle}>
              {category?.key === 'consultation' ? 'Choisissez un service médical' : category?.label}
            </h3>
            <p style={styles.sectionSub}>Sélectionnez la spécialité dont vous avez besoin</p>
            <div style={styles.serviceGrid}>
              {filterByCategory(services, category?.key).map(svc => (
                <button key={svc.id} onClick={() => {
                  setSelectedService(svc)
                  if (category?.key === 'consultation') setStep(2)
                  else setStep(3)
                }} style={{
                  ...styles.serviceCard,
                  borderColor: selectedService?.id === svc.id ? '#3b82f6' : '#e2e8f0',
                  background: selectedService?.id === svc.id ? '#eff6ff' : '#fff',
                }}>
                  <div style={styles.serviceIconWrap}>
                    <span style={{ fontSize: 32 }}>{svc.icon || getIcon(svc.name)}</span>
                  </div>
                  <span style={styles.serviceName}>{svc.name}</span>
                  {svc.description && <span style={styles.serviceDesc}>{svc.description}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ETAPE 2 - MEDECIN */}
        {step === 2 && category?.key === 'consultation' && (
          <div>
            <h3 style={styles.sectionTitle}>Choisissez un médecin</h3>
            <p style={styles.sectionSub}>Service : <strong>{selectedService?.name}</strong></p>
            {doctors.length === 0 ? (
              <div style={styles.emptyBox}>Aucun médecin disponible pour ce service.</div>
            ) : (
              <div style={styles.doctorList}>
                {doctors.map(doc => (
                  <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep(3) }}
                    style={{
                      ...styles.doctorCard,
                      borderColor: selectedDoctor?.id === doc.id ? '#3b82f6' : '#e2e8f0',
                      background: selectedDoctor?.id === doc.id ? '#eff6ff' : '#fff',
                    }}>
                    <div style={styles.doctorAvatar}>
                      {(doc.fullName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={styles.doctorInfo}>
                      <span style={styles.doctorName}>Dr. {doc.fullName}</span>
                      {doc.email && <span style={styles.doctorEmail}>{doc.email}</span>}
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ETAPE 3 - CRENEAUX */}
        {step === 3 && (
          <div>
            <h3 style={styles.sectionTitle}>Créneaux disponibles</h3>
            <p style={styles.sectionSub}>
              {selectedDoctor ? `Dr. ${selectedDoctor.fullName} — ` : ''}{selectedService?.name}
            </p>

            <div style={styles.weekNav}>
              <button onClick={() => { setWeekStart(w => addDays(w, -7)); setSelectedSlot(null) }} style={styles.weekBtn}>
                <ChevronLeft size={16} /> Semaine précédente
              </button>
              <span style={styles.weekLabel}>
                Semaine du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => { setWeekStart(w => addDays(w, 7)); setSelectedSlot(null) }} style={styles.weekBtn}>
                Semaine suivante <ChevronRight size={16} />
              </button>
            </div>

            <div style={styles.legend}>
              <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#10b981' }} /> Disponible</span>
              <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#3b82f6', boxShadow: '0 0 0 2px #3b82f6' }} /> Sélectionné</span>
            </div>

            {loading ? (
              <div style={styles.loadingWrap}>
                <div style={styles.spinner} />
                <span style={{ color: '#64748b', fontSize: 14 }}>Chargement…</span>
              </div>
            ) : (
              <div style={styles.calendarWrap}>
                <div style={styles.calHeader}>
                  <div style={styles.calTimeCol} />
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = addDays(weekStart, i)
                    const isToday = toISO(d) === toISO(new Date())
                    return (
                      <div key={i} style={{ ...styles.calDayHeader, background: isToday ? '#eff6ff' : 'transparent', color: isToday ? '#3b82f6' : '#475569' }}>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{JOURS[i]}</span>
                        <span style={{ fontSize: 14, fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={styles.calBody}>
                  {(() => {
                    const byDay = slotsByDay()
                    const days = Object.keys(byDay).sort()
                    const hours = Array.from({ length: 21 }, (_, i) => {
                      const h = Math.floor(i / 2) + 8
                      const m = i % 2 === 0 ? '00' : '30'
                      return `${String(h).padStart(2, '0')}:${m}`
                    })
                    return hours.map(hour => (
                      <div key={hour} style={styles.calRow}>
                        <div style={styles.calTimeLabel}>{hour}</div>
                        {days.map(dayKey => {
                          const daySlots = byDay[dayKey] || []
                          const slot = daySlots.find(s => fmtTime(s.startTime) === hour)
                          const isSelected = selectedSlot?.id === slot?.id
                          return (
                            <div key={dayKey} style={styles.calCell}>
                              {slot ? (
                                <button onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                  style={{
                                    ...styles.slotBtn,
                                    background: isSelected ? '#3b82f6' : '#d1fae5',
                                    color: isSelected ? '#fff' : '#065f46',
                                    border: isSelected ? '2px solid #2563eb' : '1px solid #6ee7b7',
                                    boxShadow: isSelected ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                  }}>
                                  {fmtTime(slot.startTime)}
                                </button>
                              ) : (
                                <div style={styles.slotEmpty} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div style={styles.selectedSlotBanner}>
                <CheckCircle size={18} color="#10b981" />
                <span>
                  Créneau sélectionné : <strong>
                    {new Date(selectedSlot.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </strong> à <strong>{fmtTime(selectedSlot.startTime)}</strong>
                </span>
              </div>
            )}

            <div style={styles.actionRow}>
              <button onClick={goBack} style={styles.btnGhost}>Retour</button>
              <button onClick={() => { if (selectedSlot) setStep(4) }}
                disabled={!selectedSlot}
                style={{ ...styles.btnPrimary, opacity: selectedSlot ? 1 : 0.4 }}>
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* ETAPE 4 - CONFIRMATION */}
        {step === 4 && (
          <div>
            <h3 style={styles.sectionTitle}>Récapitulatif</h3>
            <p style={styles.sectionSub}>Vérifiez les informations avant de confirmer</p>
            <div style={styles.summaryCard}>
              {[
                ['\uD83D\uDCC5', 'Date', new Date(selectedSlot?.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                ['\uD83D\uDD50', 'Heure', `${fmtTime(selectedSlot?.startTime)} – ${fmtTime(selectedSlot?.endTime)}`],
                ['\uD83C\uDFE5', 'Service', selectedService?.name],
                ...(selectedDoctor ? [['\uD83D\uDC68\u200D\u2695\uFE0F', 'Médecin', `Dr. ${selectedDoctor.fullName}`]] : []),
                ['\uD83D\uDCCB', 'Type', category?.label],
              ].map(([icon, label, val]) => (
                <div key={label} style={styles.summaryRow}>
                  <span style={styles.summaryIcon}>{icon}</span>
                  <span style={styles.summaryLabel}>{label}</span>
                  <span style={styles.summaryVal}>{val}</span>
                </div>
              ))}
            </div>

            <div style={styles.reasonWrap}>
              <label style={styles.reasonLabel}>
                Motif / Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optionnel)</span>
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Décrivez brièvement la raison de votre consultation…"
                rows={3} style={styles.textarea} />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.actionRow}>
              <button onClick={goBack} style={styles.btnGhost} disabled={loading}>Retour</button>
              <button onClick={handleBook} style={styles.btnConfirm} disabled={loading}>
                {loading
                  ? <><div style={{ ...styles.spinner, width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Envoi…</>
                  : <><CheckCircle size={16} /> Confirmer le RDV</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 900, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' },
  headerTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 },
  headerSub: { fontSize: 13, color: '#64748b', margin: 0 },
  stepperWrap: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 },
  stepperItem: { display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' },
  stepperDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.3s' },
  stepperLabel: { fontSize: 11, whiteSpace: 'nowrap', transition: 'color 0.3s' },
  stepperLine: { width: 32, height: 2, borderRadius: 2, marginLeft: 6, transition: 'background 0.3s' },
  content: { background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6, marginTop: 0 },
  sectionSub: { fontSize: 13, color: '#64748b', marginBottom: 24, marginTop: 0 },
  catGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  catCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, border: '1.5px solid', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  catIconWrap: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  catIcon: { fontSize: 26 },
  catInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  catLabel: { fontSize: 15, fontWeight: 600, color: '#0f172a' },
  catDesc: { fontSize: 12, color: '#64748b' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  serviceCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 12px', borderRadius: 16, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  serviceIconWrap: { width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 13, fontWeight: 600, color: '#0f172a' },
  serviceDesc: { fontSize: 11, color: '#64748b', lineHeight: 1.4 },
  doctorList: { display: 'flex', flexDirection: 'column', gap: 10 },
  doctorCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
  doctorAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  doctorInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  doctorName: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  doctorEmail: { fontSize: 12, color: '#64748b' },
  weekNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 },
  weekBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 500 },
  weekLabel: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  legend: { display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' },
  legendDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  calendarWrap: { border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'auto', maxHeight: 420 },
  calHeader: { display: 'flex', position: 'sticky', top: 0, background: '#fff', zIndex: 2, borderBottom: '1px solid #e2e8f0' },
  calTimeCol: { width: 52, flexShrink: 0 },
  calDayHeader: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px', minWidth: 80, borderLeft: '1px solid #f1f5f9', gap: 2 },
  calBody: { display: 'flex', flexDirection: 'column' },
  calRow: { display: 'flex', borderBottom: '1px solid #f8fafc', minHeight: 36 },
  calTimeLabel: { width: 52, flexShrink: 0, fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 },
  calCell: { flex: 1, minWidth: 80, padding: '3px 4px', borderLeft: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  slotBtn: { width: '100%', padding: '4px 2px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  slotEmpty: { width: '100%', height: 28 },
  selectedSlotBanner: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, marginTop: 16, fontSize: 13, color: '#166534' },
  actionRow: { display: 'flex', gap: 12, marginTop: 24 },
  btnGhost: { flex: 1, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#475569' },
  btnPrimary: { flex: 2, padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', transition: 'opacity 0.2s' },
  btnConfirm: { flex: 2, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  summaryCard: { background: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  summaryRow: { display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' },
  summaryIcon: { fontSize: 18, width: 24 },
  summaryLabel: { fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 },
  summaryVal: { fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1 },
  reasonWrap: { marginBottom: 20 },
  reasonLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
  textarea: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13, color: '#374151', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  emptyBox: { textAlign: 'center', padding: 40, color: '#64748b', fontSize: 14, background: '#f8fafc', borderRadius: 14 },
  errorBox: { padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, marginBottom: 16 },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 },
  spinner: { width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  successWrap: { textAlign: 'center', padding: '60px 20px' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  successDetails: { display: 'inline-flex', flexDirection: 'column', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '20px 32px', textAlign: 'left' },
  successRow: { fontSize: 14, color: '#166534', display: 'flex', alignItems: 'center', gap: 10 },
}
