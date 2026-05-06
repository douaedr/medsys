import { Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../shared/NotificationBell'

const ROLE_LABELS = {
  MEDECIN: 'Medecin', INFIRMIER: 'Infirmier(e)', BRANCARDIER: 'Brancardier',
  AIDE_SOIGNANT: 'Aide Soignant', CHEF_SERVICE: 'Chef de Service',
  SECRETARY: 'Secretaire', ADMIN: 'Administrateur', DIRECTEUR: 'Directeur',
  PERSONNEL: 'Personnel', PATIENT: 'Patient',
}

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth()
  const showBell = user?.role === 'PATIENT' && user?.patientId

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <header className="bg-white border-b border-slate-100 px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-soft">
      <div>
        {title && <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {!title && (
          <div>
            <p className="text-xs text-slate-400 capitalize">{dateStr}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Recherche */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 w-56 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-primary-400 focus:bg-white transition-all"
          />
        </div>

        {/* Notifs patient */}
        {showBell && <NotificationBell />}

        {/* Badge role */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-primary-700">{ROLE_LABELS[user?.role] || user?.role}</span>
        </div>
      </div>
    </header>
  )
}
