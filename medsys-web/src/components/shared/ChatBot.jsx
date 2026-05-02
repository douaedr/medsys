import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react'
import { chatbotApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

/**
 * 🔧 NEW: Composant ChatBot flottant intégrant le service RAG (Gemini).
 *
 * Affichage : bouton rond en bas à droite qui ouvre un panneau de chat.
 * Le chatbot utilise le `patientId` de l'utilisateur connecté pour
 * personnaliser ses réponses (récupère le dossier médical + RDV).
 *
 * Usage:
 *   <ChatBot />   // dans un dashboard où useAuth() renvoie un user PATIENT
 *
 * Ou avec un patientId explicite :
 *   <ChatBot patientId={42} />
 */
export default function ChatBot({ patientId: propPatientId }) {
  const { user } = useAuth()
  const patientId = propPatientId ?? user?.patientId ?? user?.userId

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Bonjour ${user?.prenom || ''} 👋 Je suis votre assistant médical. Posez-moi vos questions sur votre dossier, vos rendez-vous, vos traitements...`,
      timestamp: new Date(),
    },
  ])
  const scrollRef = useRef(null)

  // Auto-scroll vers le dernier message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    if (!patientId) {
      setMessages(m => [...m, {
        role: 'bot',
        text: "Désolé, je n'arrive pas à identifier votre dossier patient. Veuillez vous reconnecter.",
        timestamp: new Date(),
      }])
      return
    }

    // Ajout du message utilisateur
    setMessages(m => [...m, { role: 'user', text: question, timestamp: new Date() }])
    setInput('')
    setLoading(true)

    try {
      const res = await chatbotApi.ask(question, patientId)
      const reponse = res.data?.reponse || "Je n'ai pas pu obtenir de réponse."
      setMessages(m => [...m, { role: 'bot', text: reponse, timestamp: new Date() }])
    } catch (err) {
      const errMsg = err.response?.data?.message
        || err.response?.data?.error
        || 'Désolé, une erreur est survenue. Veuillez réessayer.'
      setMessages(m => [...m, { role: 'bot', text: `❌ ${errMsg}`, timestamp: new Date(), error: true }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Quel est mon groupe sanguin ?',
    'Quand est mon prochain rendez-vous ?',
    'Quels sont mes antécédents ?',
    'Mes médicaments actuels ?',
  ]

  return (
    <>
      {/* Bouton flottant */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="Ouvrir l'assistant médical"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Assistant médical
          </span>
        </button>
      )}

      {/* Panneau de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-600 to-accent-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Assistant médical</div>
                <div className="text-xs opacity-80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  En ligne · IA Gemini
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : msg.error
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions (seulement si juste 1 message d'accueil) */}
            {messages.length === 1 && !loading && (
              <div className="pt-2">
                <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
                  Suggestions
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); setTimeout(() => handleSubmit(), 50) }}
                      className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Posez une question..."
                rows={1}
                disabled={loading}
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:bg-white resize-none disabled:opacity-50"
                style={{ maxHeight: '100px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Envoyer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 text-center">
              Powered by Gemini · Vos données restent confidentielles
            </div>
          </form>
        </div>
      )}
    </>
  )
}
