import { useEffect, useState, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from '../context/AuthContext'
import { patientApi } from '../api/api'

/**
 * 🔧 V4: Hook pour les notifications temps reel via WebSocket+STOMP.
 *
 * Fonctionnalites :
 *  1. Charge les notifications historiques au montage (via REST)
 *  2. Ouvre une connexion WebSocket sur /ws (port 8081 via proxy Vite)
 *  3. S'abonne au topic /topic/notifications/{patientId}
 *  4. Quand une notif arrive : ajout en haut de la liste + badge mis a jour
 *
 * Usage :
 *   const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
 *
 * Reconnexion automatique en cas de perte de connexion.
 */
export function useNotifications() {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)

  const patientId = user?.patientId

  // ─── Charger les notifs historiques (REST) ───
  const loadHistorical = useCallback(async () => {
    if (!patientId) return
    try {
      const res = await patientApi.notifications()
      const list = (res.data || []).map((n, i) => ({
        id: n.id || `hist-${i}-${Date.now()}`,
        subject: n.subject || n.titre || 'Notification',
        message: n.message || n.contenu || '',
        timestamp: n.timestamp || n.date || new Date().toISOString(),
        read: n.lu === true || n.read === true,
        appointmentId: n.appointmentId,
      }))
      setNotifications(list)
    } catch (err) {
      console.warn('[useNotifications] Failed to load historical:', err.message)
    }
  }, [patientId])

  // ─── Connexion WebSocket ───
  useEffect(() => {
    if (!patientId || !token) return

    loadHistorical()

    // SockJS necessite une URL absolue (pas de proxy Vite pour les WS chunked)
    // Donc on pointe directement vers ms-patient-personnel sur 8081
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:8081/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        // Optionnel : le serveur peut valider le token via interceptor STOMP
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('[WS] Connected to WebSocket')
        setConnected(true)

        // S'abonner au topic specifique au patient
        const topic = `/topic/notifications/${patientId}`
        client.subscribe(topic, (message) => {
          try {
            const payload = JSON.parse(message.body)
            console.log('[WS] Notification received:', payload)

            const notif = {
              id: `ws-${Date.now()}-${Math.random()}`,
              subject: payload.subject || 'Notification',
              message: payload.message || '',
              timestamp: payload.timestamp || new Date().toISOString(),
              read: false,
              appointmentId: payload.appointmentId,
            }

            // Ajouter en haut de la liste
            setNotifications(prev => [notif, ...prev])

            // Notification du navigateur (si autorise)
            if (Notification.permission === 'granted') {
              new Notification('MedSys', {
                body: notif.subject + ' - ' + notif.message,
                icon: '/favicon.ico',
              })
            }
          } catch (err) {
            console.error('[WS] Error parsing notification:', err)
          }
        })

        console.log(`[WS] Subscribed to ${topic}`)
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message'])
        setConnected(false)
      },

      onDisconnect: () => {
        console.log('[WS] Disconnected')
        setConnected(false)
      },

      onWebSocketError: (error) => {
        console.warn('[WS] WebSocket error (will retry):', error.message || error)
        setConnected(false)
      },
    })

    client.activate()
    clientRef.current = client

    // Demander la permission pour les notifs navigateur
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Cleanup
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
      }
    }
  }, [patientId, token, loadHistorical])

  // ─── Helpers ───
  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh: loadHistorical,
  }
}
