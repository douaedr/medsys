import { useEffect, useState } from 'react'
import { personnelMessagesApi } from '../../api/api'
import { Inbox, Send, AlertCircle, Mail, MailOpen, X } from 'lucide-react'
import { cn, formatDateTime } from '../../lib/utils'
import LoadingState from '../shared/LoadingState'
import EmptyState from '../shared/EmptyState'

/**
 * FEAT 2 — Panel de messagerie inter-personnel.
 * À utiliser dans les onglets "messages" de PersonnelDashboard, ChefServiceDashboard, DirecteurDashboard.
 */
export default function MessagesPanel() {
  const [view, setView] = useState('recus') // 'recus' | 'envoyes'
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [collegues, setCollegues] = useState([])
  const [showCompose, setShowCompose] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [form, setForm] = useState({
    destinataireId: '',
    contenu: '',
    priorite: 'NORMALE',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [mRes, cRes] = await Promise.all([
        view === 'recus' ? personnelMessagesApi.recus() : personnelMessagesApi.envoyes(),
        collegues.length === 0 ? personnelMessagesApi.collegues() : Promise.resolve({ data: collegues }),
      ])
      setMessages(mRes.data || [])
      if (cRes.data && cRes.data.length) setCollegues(cRes.data)
    } catch (err) {
      console.error('Erreur chargement messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [view])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.destinataireId || !form.contenu.trim()) {
      alert('Sélectionnez un destinataire et écrivez un message')
      return
    }
    try {
      await personnelMessagesApi.envoyer({
        destinataireId: parseInt(form.destinataireId),
        contenu: form.contenu.trim(),
        priorite: form.priorite,
      })
      setShowCompose(false)
      setForm({ destinataireId: '', contenu: '', priorite: 'NORMALE' })
      if (view === 'envoyes') load()
      else alert('Message envoyé.')
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de l\'envoi')
    }
  }

  const handleOpenMessage = async (msg) => {
    setSelectedMsg(msg)
    if (view === 'recus' && !msg.lu) {
      try {
        await personnelMessagesApi.marquerLu(msg.id)
        setMessages(messages.map(m => m.id === msg.id ? { ...m, lu: true } : m))
      } catch (e) { /* silent */ }
    }
  }

  const nonLusCount = messages.filter(m => !m.lu).length

  return (
    <div className="space-y-4">
      {/* Header avec toggle reçus/envoyés et bouton composer */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setView('recus')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              view === 'recus' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Inbox className="w-4 h-4" />
            Reçus
            {view === 'recus' && nonLusCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                {nonLusCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView('envoyes')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              view === 'envoyes' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Send className="w-4 h-4" />
            Envoyés
          </button>
        </div>
        <button onClick={() => setShowCompose(!showCompose)} className="btn-primary">
          <Send className="w-4 h-4" />
          Nouveau message
        </button>
      </div>

      {/* Formulaire composer */}
      {showCompose && (
        <form onSubmit={handleSend} className="card p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Nouveau message</h3>
          <div>
            <label className="label">Destinataire *</label>
            <select
              className="input"
              value={form.destinataireId}
              onChange={e => setForm({ ...form, destinataireId: e.target.value })}
              required
            >
              <option value="">— Sélectionner un collègue —</option>
              {collegues.map(c => (
                <option key={c.userId} value={c.userId}>
                  {c.prenom} {c.nom} ({c.role}) — {c.email}
                </option>
              ))}
            </select>
            {collegues.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Aucun collègue trouvé. Vérifiez la connexion à ms-auth.
              </p>
            )}
          </div>
          <div>
            <label className="label">Priorité</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={form.priorite === 'NORMALE'}
                  onChange={() => setForm({ ...form, priorite: 'NORMALE' })}
                />
                <span className="text-sm">Normale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={form.priorite === 'URGENTE'}
                  onChange={() => setForm({ ...form, priorite: 'URGENTE' })}
                />
                <span className="text-sm flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-3 h-3" /> Urgente
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="label">Message * ({form.contenu.length}/1000)</label>
            <textarea
              className="input min-h-[120px]"
              maxLength={1000}
              value={form.contenu}
              onChange={e => setForm({ ...form, contenu: e.target.value })}
              placeholder="Votre message..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Envoyer</button>
            <button type="button" className="btn-ghost" onClick={() => setShowCompose(false)}>Annuler</button>
          </div>
        </form>
      )}

      {/* Liste */}
      {loading ? (
        <LoadingState />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={view === 'recus' ? Inbox : Send}
          title={view === 'recus' ? 'Aucun message reçu' : 'Aucun message envoyé'}
          description={view === 'recus' ? 'Vous n\'avez pas de message dans votre boîte de réception.' : 'Vous n\'avez encore envoyé aucun message.'}
        />
      ) : (
        <div className="card divide-y divide-slate-100">
          {messages.map(m => {
            const otherName = view === 'recus'
              ? `${m.expediteurNom || 'Anonyme'}`
              : `${m.destinataireNom || 'Destinataire'}`
            const otherRole = view === 'recus' ? m.expediteurRole : m.destinataireRole
            return (
              <button
                key={m.id}
                onClick={() => handleOpenMessage(m)}
                className={cn(
                  'w-full text-left p-4 hover:bg-slate-50 transition-all flex items-start gap-3',
                  view === 'recus' && !m.lu && 'bg-blue-50/40'
                )}
              >
                {view === 'recus' ? (
                  m.lu
                    ? <MailOpen className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    : <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Send className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('font-semibold text-sm', !m.lu && view === 'recus' ? 'text-slate-900' : 'text-slate-700')}>
                      {otherName}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      {otherRole}
                    </span>
                    {m.priorite === 'URGENTE' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" /> URGENT
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 truncate">{m.contenu}</div>
                  <div className="text-xs text-slate-400 mt-1">{formatDateTime(m.dateEnvoi)}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal détail */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedMsg(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  {view === 'recus'
                    ? `De : ${selectedMsg.expediteurNom || '—'}`
                    : `À : ${selectedMsg.destinataireNom || '—'}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {(view === 'recus' ? selectedMsg.expediteurRole : selectedMsg.destinataireRole)} · {formatDateTime(selectedMsg.dateEnvoi)}
                </p>
              </div>
              <button onClick={() => setSelectedMsg(null)} className="btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {selectedMsg.priorite === 'URGENTE' && (
                <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                  <AlertCircle className="w-4 h-4" /> Message urgent
                </div>
              )}
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedMsg.contenu}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
