import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, Calendar, MessageSquare, Wifi, WifiOff } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDateTime } from '../../lib/utils'

/**
 * 🔧 V4: Cloche de notifications dans le Topbar.
 *
 * - Badge avec le nombre de notifs non lues
 * - Click → dropdown avec la liste
 * - Indicateur de connexion WebSocket
 * - "Marquer tout comme lu"
 */
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { notifications, unreadCount, connected, markAsRead, markAllAsRead } = useNotifications()

  // Fermer dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const getIcon = (subject) => {
    const s = (subject || '').toLowerCase()
    if (s.includes('rendez-vous') || s.includes('rdv')) return Calendar
    if (s.includes('message')) return MessageSquare
    return Bell
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Indicateur connexion WS (petit point vert/rouge en bas) */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
            connected ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          title={connected ? 'Temps réel actif' : 'Hors ligne'}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                {connected ? (
                  <><Wifi className="w-3 h-3 text-emerald-500" /> Temps réel</>
                ) : (
                  <><WifiOff className="w-3 h-3" /> Hors ligne</>
                )}
                {unreadCount > 0 && <span>· {unreadCount} non lue(s)</span>}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 font-semibold hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Aucune notification pour l'instant
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(n => {
                  const Icon = getIcon(n.subject)
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`w-full text-left p-4 hover:bg-slate-50 flex items-start gap-3 transition-colors ${
                        !n.read ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        !n.read ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-slate-900 text-sm">
                            {n.subject}
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {n.message}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {formatDateTime(n.timestamp)}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setOpen(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
