import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Calendar, FileText, MessageSquare,
  Settings, LogOut, Stethoscope, UserCog, BarChart3, Activity, User,
  FolderOpen
} from 'lucide-react'
import { cn } from '../../lib/utils'

const MENUS = {
  PATIENT: [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/patient/dashboard?tab=dossier', icon: FileText, label: 'Mon dossier' },
    { to: '/patient/dashboard?tab=rdv', icon: Calendar, label: 'Mes rendez-vous' },
    { to: '/patient/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
    { to: '/patient/dashboard?tab=documents', icon: FolderOpen, label: 'Mes documents' },
    { to: '/patient/dashboard?tab=profil', icon: User, label: 'Mon profil' },
  ],
  MEDECIN: [
    { to: '/personnel/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/personnel/dashboard?tab=patients', icon: Users, label: 'Patients' },
    { to: '/personnel/dashboard?tab=consultations', icon: Stethoscope, label: 'Consultations' },
    { to: '/personnel/dashboard?tab=rdv', icon: Calendar, label: 'Rendez-vous' },
  ],
  PERSONNEL: [
    { to: '/personnel/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/personnel/dashboard?tab=patients', icon: Users, label: 'Patients' },
    { to: '/personnel/dashboard?tab=rdv', icon: Calendar, label: 'Rendez-vous' },
  ],
  SECRETARY: [
    { to: '/personnel/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/personnel/dashboard?tab=patients', icon: Users, label: 'Patients' },
    { to: '/personnel/dashboard?tab=rdv', icon: Calendar, label: 'Rendez-vous' },
  ],
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin?tab=users', icon: UserCog, label: 'Utilisateurs' },
    { to: '/admin?tab=personnel', icon: Users, label: 'Personnel' },
    { to: '/admin?tab=settings', icon: Settings, label: 'Paramètres' },
  ],
  DIRECTEUR: [
    { to: '/directeur', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/directeur?tab=stats', icon: BarChart3, label: 'Statistiques' },
    { to: '/directeur?tab=patients', icon: Users, label: 'Patients' },
    { to: '/directeur?tab=medecins', icon: Stethoscope, label: 'Médecins' },
    { to: '/directeur?tab=rapports', icon: FileText, label: 'Rapports' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menu = MENUS[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight">MedSys</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={!item.to.includes('?')}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon className="w-4.5 h-4.5" strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
            {(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
