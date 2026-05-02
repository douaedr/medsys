import { Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../shared/NotificationBell'

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth()

  // Cloche notifs visible uniquement pour les patients (qui ont un patientId)
  const showBell = user?.role === 'PATIENT' && user?.patientId

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {/* Recherche universelle (placeholder) */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:bg-white transition-all"
          />
        </div>

        {/* 🔧 V4: Cloche de notifications WebSocket (patients uniquement) */}
        {showBell && <NotificationBell />}
      </div>
    </header>
  )
}
