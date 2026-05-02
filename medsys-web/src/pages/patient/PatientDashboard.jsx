import { useEffect, useState } from 'react'
import { patientApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import LoadingState from '../../components/shared/LoadingState'
import EmptyState from '../../components/shared/EmptyState'
import ChatBot from '../../components/shared/ChatBot'
import NouveauRdv from './NouveauRdv'
import { useTab } from '../../lib/useTab'
import {
  FileText, Calendar, MessageSquare, Bell, Download, Upload,
  Pill, Activity, Send, Plus, User, Phone, MapPin, Shield,
  Edit2, Save, X, Trash2, FolderOpen, Eye
} from 'lucide-react'
import { formatDate, formatDateTime } from '../../lib/utils'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useTab('dashboard')
  const [dossier, setDossier] = useState(null)
  const [rdv, setRdv] = useState([])
  const [messages, setMessages] = useState([])
  const [notifications, setNotifications] = useState([])
  const [documents, setDocuments] = useState([])
  const [profil, setProfil] = useState(null)
  const [medecins, setMedecins] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState({ contenu: '', medecinId: null, medecinNom: '' })
  const [showCompose, setShowCompose] = useState(false)
  const [showNouveauRdv, setShowNouveauRdv] = useState(false)
  const [editProfil, setEditProfil] = useState(false)
  const [profilForm, setProfilForm] = useState({})
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const loadData = async () => {
    try {
      const [d, r, m, n, docs, p, meds] = await Promise.all([
        patientApi.myDossier().catch(() => ({ data: null })),
        patientApi.getRdv().catch(() => ({ data: [] })),
        patientApi.getMessages().catch(() => ({ data: [] })),
        patientApi.notifications().catch(() => ({ data: [] })),
        patientApi.getDocuments().catch(() => ({ data: [] })),
        patientApi.me().catch(() => ({ data: null })),
        patientApi.getMedecins().catch(() => ({ data: [] })),
      ])
      setDossier(d.data)
      setRdv(r.data || [])
      setMessages(m.data || [])
      setNotifications(n.data || [])
      setDocuments(docs.data || [])
      setProfil(p.data)
      setMedecins(meds.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  // ── Export PDF ──
  const handleExportPdf = async () => {
    try {
      const res = await patientApi.exportPdf()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'mon-dossier.pdf'; a.click()
    } catch { alert("Erreur lors de l'export") }
  }

  // ── BUG 3 FIX: Annulation RDV — envoyer le bon ID ──
  const handleAnnulerRdv = async (rdvItem) => {
    if (!confirm('Annuler ce rendez-vous ?')) return
    try {
      await patientApi.annulerRdv(rdvItem.id)
      const r = await patientApi.getRdv()
      setRdv(r.data || [])
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation")
    }
  }

  // ── BUG 4 FIX: Messagerie — sélectionner un médecin par nom ──
  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      await patientApi.envoyerMessage(newMessage)
      setShowCompose(false)
      setNewMessage({ contenu: '', medecinId: null, medecinNom: '' })
      const m = await patientApi.getMessages()
      setMessages(m.data || [])
    } catch { alert("Erreur lors de l'envoi") }
  }

  const handleMarquerLu = async (id) => {
    try {
      await patientApi.marquerLu(id)
      const m = await patientApi.getMessages()
      setMessages(m.data || [])
    } catch {}
  }

  // ── BUG 2 FIX: Upload document ──
  const handleUploadDoc = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    try {
      const formData = new FormData()
      formData.append('fichier', file)
      formData.append('type', 'AUTRE')
      formData.append('description', file.name)
      await patientApi.uploadDocument(formData)
      const docs = await patientApi.getDocuments()
      setDocuments(docs.data || [])
    } catch { alert("Erreur lors de l'upload") }
    finally { setUploadingDoc(false) }
  }

  const handleDeleteDoc = async (id) => {
    if (!confirm('Supprimer ce document ?')) return
    try {
      await patientApi.deleteDocument(id)
      const docs = await patientApi.getDocuments()
      setDocuments(docs.data || [])
    } catch { alert('Erreur lors de la suppression') }
  }

  // ── BUG 2 FIX: Update profil ──
  const handleSaveProfil = async () => {
    try {
      await patientApi.updateMe(profilForm)
      const p = await patientApi.me()
      setProfil(p.data)
      setEditProfil(false)
    } catch { alert('Erreur lors de la mise à jour') }
  }

  if (loading) return <DashboardLayout title="Tableau de bord" subtitle="Chargement…"><LoadingState /></DashboardLayout>

  const prochainRdv = rdv.filter(r => new Date(r.date) > new Date())[0]
  const messagesNonLus = messages.filter(m => !m.lu && m.expediteur !== 'PATIENT').length

  const titles = {
    dashboard: `Bonjour ${user?.prenom || ''} 👋`, dossier: 'Mon dossier médical',
    rdv: 'Mes rendez-vous', messages: 'Messagerie',
    documents: 'Mes documents', profil: 'Mon profil',
  }
  const subtitles = {
    dashboard: "Voici un aperçu de votre santé aujourd'hui",
    dossier: 'Vos informations médicales complètes',
    rdv: 'Tous vos rendez-vous passés et à venir',
    messages: 'Échangez avec votre équipe médicale',
    documents: 'Vos documents médicaux uploadés',
    profil: 'Gérez vos informations personnelles',
  }

  return (
    <DashboardLayout title={showNouveauRdv ? 'Nouveau rendez-vous' : titles[tab]}
                     subtitle={showNouveauRdv ? 'Remplissez les informations ci-dessous' : subtitles[tab]}>

      {showNouveauRdv && (
        <NouveauRdv onBack={() => setShowNouveauRdv(false)}
          onSuccess={async () => { setShowNouveauRdv(false); const r = await patientApi.getRdv().catch(() => ({ data: [] })); setRdv(r.data || []) }} />
      )}

      {!showNouveauRdv && (<>

        {/* ═══ DASHBOARD ═══ */}
        {tab === 'dashboard' && (<>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Calendar} label="Rendez-vous" value={rdv.length} color="primary" />
            <StatCard icon={MessageSquare} label="Messages non lus" value={messagesNonLus} color="accent" />
            <StatCard icon={FileText} label="Consultations" value={dossier?.consultations?.length || 0} color="success" />
            <StatCard icon={FolderOpen} label="Documents" value={documents.length} color="warning" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Prochain rendez-vous</h3>
                <button onClick={() => setTab('rdv')} className="text-xs text-primary-600 font-semibold hover:underline">Voir tous →</button>
              </div>
              {prochainRdv ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex flex-col items-center justify-center">
                    <div className="text-xs font-bold text-primary-700">{new Date(prochainRdv.date).toLocaleDateString('fr-FR',{month:'short'})}</div>
                    <div className="text-lg font-bold text-primary-900 leading-none">{new Date(prochainRdv.date).getDate()}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{prochainRdv.medecinNom || prochainRdv.medecin || prochainRdv.doctorName || 'Médecin'}</div>
                    <div className="text-sm text-slate-500">{formatDateTime(prochainRdv.date)} {prochainRdv.heure ? `à ${prochainRdv.heure}` : ''}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-3">Aucun rendez-vous à venir</p>
                  <button onClick={() => setShowNouveauRdv(true)} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Prendre un RDV</button>
                </div>
              )}
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Mon dossier médical</h3>
              <p className="text-sm text-slate-500 mb-4">Téléchargez votre dossier complet au format PDF</p>
              <div className="flex gap-2">
                <button onClick={handleExportPdf} className="btn-primary"><Download className="w-4 h-4" /> Télécharger</button>
                <button onClick={() => setTab('dossier')} className="btn-outline">Consulter</button>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Activité récente</h3>
            {notifications.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">Aucune activité récente</p> : (
              <div className="space-y-3">
                {notifications.slice(0,5).map((n,i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-primary-600" /></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(n.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>)}

        {/* ═══ DOSSIER ═══ */}
        {tab === 'dossier' && (<>
          <div className="flex items-center justify-end mb-4 gap-2">
            <button onClick={handleExportPdf} className="btn-outline"><Download className="w-4 h-4" /> Télécharger PDF</button>
          </div>
          {dossier?.patient && (
            <div className="card p-6 mb-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-600" /> Informations personnelles</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Nom complet:</span> <span className="font-semibold">{dossier.patient.prenom} {dossier.patient.nom}</span></div>
                <div><span className="text-slate-500">CIN:</span> <span className="font-semibold">{dossier.patient.cin || '—'}</span></div>
                <div><span className="text-slate-500">Date de naissance:</span> <span className="font-semibold">{formatDate(dossier.patient.dateNaissance)}</span></div>
                <div><span className="text-slate-500">Sexe:</span> <span className="font-semibold">{dossier.patient.sexe || '—'}</span></div>
                <div><span className="text-slate-500">Téléphone:</span> <span className="font-semibold">{dossier.patient.telephone || '—'}</span></div>
                <div><span className="text-slate-500">Groupe sanguin:</span> <span className="font-semibold">{dossier.patient.groupeSanguin || '—'}</span></div>
              </div>
            </div>
          )}
          <div className="card p-6 mb-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-primary-600" /> Antécédents médicaux</h3>
            {dossier?.antecedents?.length > 0 ? (
              <ul className="space-y-2">{dossier.antecedents.map((a,i) => (
                <li key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="font-semibold text-slate-900">{a.typeAntecedent || a.type || 'Antécédent'}</div>
                  <div className="text-slate-600 mt-1">{a.description}</div>
                </li>
              ))}</ul>
            ) : <p className="text-sm text-slate-500">Aucun antécédent enregistré</p>}
          </div>
          <div className="card p-6 mb-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-600" /> Consultations ({dossier?.consultations?.length || 0})</h3>
            {dossier?.consultations?.length > 0 ? (
              <ul className="space-y-2">{dossier.consultations.map((c,i) => (
                <li key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="font-semibold text-slate-900">{formatDateTime(c.dateConsultation || c.date)}</div>
                  <div className="text-slate-600 mt-1">{c.motif || c.diagnostic || 'Consultation'}</div>
                  {c.medecinNomComplet && <div className="text-xs text-slate-500 mt-1">Dr. {c.medecinNomComplet}</div>}
                </li>
              ))}</ul>
            ) : <p className="text-sm text-slate-500">Aucune consultation enregistrée</p>}
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Pill className="w-5 h-5 text-primary-600" /> Ordonnances</h3>
            {dossier?.ordonnances?.length > 0 ? (
              <ul className="space-y-2">{dossier.ordonnances.map((o,i) => (
                <li key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="font-semibold text-slate-900">{formatDate(o.dateOrdonnance || o.date)}</div>
                  {o.lignes?.length > 0 && <ul className="mt-2 space-y-1 text-slate-600">{o.lignes.map((l,j) => <li key={j}>• {l.medicament} — {l.posologie || l.dosage}</li>)}</ul>}
                </li>
              ))}</ul>
            ) : <p className="text-sm text-slate-500">Aucune ordonnance</p>}
          </div>
        </>)}

        {/* ═══ RDV ═══ */}
        {tab === 'rdv' && (
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Mes rendez-vous</h3>
                <p className="text-sm text-slate-500 mt-0.5">{rdv.length} rendez-vous au total</p>
              </div>
              <button onClick={() => setShowNouveauRdv(true)} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Prendre un RDV</button>
            </div>
            {rdv.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 mb-1">Aucun rendez-vous</p>
                <p className="text-sm text-slate-500 mb-4">Vous n'avez aucun rendez-vous prévu.</p>
                <button onClick={() => setShowNouveauRdv(true)} className="btn-primary"><Plus className="w-4 h-4" /> Prendre mon premier RDV</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rdv.map((r,i) => {
                  const isPast = new Date(r.date) < new Date()
                  const isCancelled = r.statut === 'ANNULE'
                  return (
                    <div key={r.id || i} className="p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isPast || isCancelled ? 'bg-slate-100' : 'bg-primary-50'}`}>
                          <div className={`text-xs font-bold ${isPast || isCancelled ? 'text-slate-500' : 'text-primary-700'}`}>{new Date(r.date).toLocaleDateString('fr-FR',{month:'short'})}</div>
                          <div className={`text-xl font-bold leading-none ${isPast || isCancelled ? 'text-slate-600' : 'text-primary-900'}`}>{new Date(r.date).getDate()}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{r.medecinNom || r.medecin || r.doctorName || 'Médecin'}</div>
                          <div className="text-sm text-slate-500">{formatDateTime(r.date)} {r.heure ? `à ${r.heure}` : ''}</div>
                          {r.motif && <div className="text-xs text-slate-400 mt-0.5">{r.motif}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCancelled ? <span className="badge-danger">Annulé</span>
                          : isPast ? <span className="badge-neutral">Passé</span>
                          : (<>
                            <span className="badge-success">{r.statut === 'CONFIRME' ? 'Confirmé' : 'En attente'}</span>
                            <button onClick={() => handleAnnulerRdv(r)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50">Annuler</button>
                          </>)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ MESSAGES (BUG 4 FIX: show doctor names) ═══ */}
        {tab === 'messages' && (
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Messagerie</h3>
                <p className="text-sm text-slate-500 mt-0.5">{messages.length} message(s) · {messagesNonLus} non lu(s)</p>
              </div>
              <button onClick={() => setShowCompose(!showCompose)} className="btn-primary btn-sm"><Send className="w-4 h-4" /> Nouveau message</button>
            </div>
            {showCompose && (
              <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
                <div>
                  <label className="label">Destinataire (médecin)</label>
                  <select className="input" required value={newMessage.medecinId || ''}
                    onChange={e => {
                      const med = medecins.find(m => m.id === Number(e.target.value))
                      setNewMessage({
                        ...newMessage,
                        medecinId: med ? med.id : null,
                        medecinNom: med ? `Dr. ${med.prenom} ${med.nom}` : '',
                      })
                    }}>
                    <option value="">-- Choisir un médecin --</option>
                    {medecins.map(m => (
                      <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} — {m.specialiteNom || m.specialite || 'Généraliste'}</option>
                    ))}
                  </select>
                </div>
                <div><label className="label">Message</label>
                  <textarea className="input" rows={4} value={newMessage.contenu}
                    onChange={e => setNewMessage({...newMessage, contenu: e.target.value})} required /></div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Envoyer</button>
                  <button type="button" onClick={() => setShowCompose(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            )}
            {messages.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Aucun message" description="Vous n'avez aucun message dans votre boîte." />
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.map((m,i) => {
                  const isFromMe = m.expediteur === 'PATIENT'
                  const senderName = isFromMe ? 'Moi' : (m.medecinNom || 'Médecin')
                  return (
                    <div key={m.id || i}
                      className={`p-6 hover:bg-slate-50 cursor-pointer ${!m.lu && !isFromMe ? 'bg-primary-50/30' : ''}`}
                      onClick={() => !m.lu && !isFromMe && handleMarquerLu(m.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isFromMe ? 'bg-primary-100 text-primary-700' : 'bg-accent-100 text-accent-700'
                            }`}>
                              {isFromMe ? 'M' : 'D'}
                            </div>
                            <div className="font-semibold text-slate-900 text-sm">{senderName}</div>
                            {!m.lu && !isFromMe && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
                            <span className="text-xs text-slate-400 ml-auto">{formatDateTime(m.dateEnvoi || m.date)}</span>
                          </div>
                          <div className="text-sm text-slate-600 ml-9">{m.contenu || m.message}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ BUG 2 FIX: DOCUMENTS TAB ═══ */}
        {tab === 'documents' && (
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Mes documents</h3>
                <p className="text-sm text-slate-500 mt-0.5">{documents.length} document(s)</p>
              </div>
              <label className="btn-primary btn-sm cursor-pointer">
                <Upload className="w-4 h-4" /> {uploadingDoc ? 'Upload…' : 'Ajouter un document'}
                <input type="file" className="hidden" onChange={handleUploadDoc} disabled={uploadingDoc}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </label>
            </div>
            {documents.length === 0 ? (
              <EmptyState icon={FolderOpen} title="Aucun document"
                description="Uploadez vos documents médicaux (ordonnances, analyses, radios…)" />
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((doc, i) => (
                  <div key={doc.id || i} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{doc.nomFichier || doc.description || 'Document'}</p>
                        <p className="text-xs text-slate-500">{doc.type || 'AUTRE'} · {formatDate(doc.dateUpload || doc.dateCreation)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a href={patientApi.getDocumentFileUrl(doc.id)} target="_blank" rel="noopener noreferrer"
                        className="btn-ghost btn-sm" title="Voir"><Eye className="w-4 h-4" /></a>
                      <button onClick={() => handleDeleteDoc(doc.id)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ BUG 2 FIX: PROFIL TAB ═══ */}
        {tab === 'profil' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-primary-600" /> Mon profil</h3>
              {!editProfil ? (
                <button onClick={() => { setEditProfil(true); setProfilForm({
                  telephone: profil?.telephone || '', email: profil?.email || '',
                  adresse: profil?.adresse || '', ville: profil?.ville || '',
                  mutuelle: profil?.mutuelle || '', numeroCNSS: profil?.numeroCNSS || '',
                }) }} className="btn-outline btn-sm"><Edit2 className="w-4 h-4" /> Modifier</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfil} className="btn-primary btn-sm"><Save className="w-4 h-4" /> Sauvegarder</button>
                  <button onClick={() => setEditProfil(false)} className="btn-ghost btn-sm"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {profil ? (
              <div className="space-y-6">
                {/* Infos non-éditables */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informations personnelles</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Nom:</span> <span className="font-semibold">{profil.prenom} {profil.nom}</span></div>
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400" /><span className="text-slate-500">CIN:</span> <span className="font-semibold">{profil.cin || '—'}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Né(e) le:</span> <span className="font-semibold">{formatDate(profil.dateNaissance)}</span></div>
                    <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Sexe:</span> <span className="font-semibold">{profil.sexe || '—'}</span></div>
                    <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-red-400" /><span className="text-slate-500">Groupe sanguin:</span> <span className="font-semibold">{profil.groupeSanguin || '—'}</span></div>
                  </div>
                </div>

                {/* Infos éditables */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact & assurance</h4>
                  {editProfil ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="label">Téléphone</label><input className="input" value={profilForm.telephone} onChange={e => setProfilForm({...profilForm, telephone: e.target.value})} /></div>
                      <div><label className="label">Email</label><input className="input" value={profilForm.email} onChange={e => setProfilForm({...profilForm, email: e.target.value})} /></div>
                      <div><label className="label">Adresse</label><input className="input" value={profilForm.adresse} onChange={e => setProfilForm({...profilForm, adresse: e.target.value})} /></div>
                      <div><label className="label">Ville</label><input className="input" value={profilForm.ville} onChange={e => setProfilForm({...profilForm, ville: e.target.value})} /></div>
                      <div><label className="label">Mutuelle</label><input className="input" value={profilForm.mutuelle} onChange={e => setProfilForm({...profilForm, mutuelle: e.target.value})} /></div>
                      <div><label className="label">N° CNSS</label><input className="input" value={profilForm.numeroCNSS} onChange={e => setProfilForm({...profilForm, numeroCNSS: e.target.value})} /></div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Téléphone:</span> <span className="font-semibold">{profil.telephone || '—'}</span></div>
                      <div className="flex items-center gap-2"><Send className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Email:</span> <span className="font-semibold">{profil.email || '—'}</span></div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Adresse:</span> <span className="font-semibold">{profil.adresse || '—'} {profil.ville || ''}</span></div>
                      <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Mutuelle:</span> <span className="font-semibold">{profil.mutuelle || '—'}</span></div>
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /><span className="text-slate-500">N° CNSS:</span> <span className="font-semibold">{profil.numeroCNSS || '—'}</span></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">Impossible de charger votre profil. Reconnectez-vous.</p>
            )}
          </div>
        )}
      </>)}

      <ChatBot />
    </DashboardLayout>
  )
}
