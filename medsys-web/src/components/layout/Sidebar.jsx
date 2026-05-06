import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { personnelMessagesApi } from '../../api/api'
import {
  LayoutDashboard, Users, Calendar, FileText, MessageSquare,
  Settings, LogOut, Stethoscope, UserCog, BarChart3, Activity, User,
  FolderOpen, Clock, ClipboardList, Network, UserCheck, Truck, Heart
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
    { to: '/patient/dashboard?tab=attente', icon: Clock, label: "Liste d'attente" },
  ],
  MEDECIN: [
    { to: '/personnel/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/personnel/dashboard?tab=patients', icon: Users, label: 'Patients' },
    { to: '/personnel/dashboard?tab=consultations', icon: Stethoscope, label: 'Consultations' },
    { to: '/personnel/dashboard?tab=rdv', icon: Calendar, label: 'Rendez-vous' },
    { to: '/personnel/dashboard?tab=dossier', icon: FileText, label: 'Dossiers medicaux' },
    { to: '/personnel/dashboard?tab=planning', icon: Clock, label: 'Mon planning' },
    { to: '/personnel/dashboard?tab=assigner-taches', icon: ClipboardList, label: 'Assigner taches' },
    { to: '/personnel/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  PERSONNEL: [
    { to: '/personnel/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/personnel/dashboard?tab=taches', icon: ClipboardList, label: 'Mes taches' },
    { to: '/personnel/dashboard?tab=patients', icon: Users, label: 'Patients' },
    { to: '/personnel/dashboard?tab=rdv', icon: Calendar, label: 'Rendez-vous' },
    { to: '/personnel/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  SECRETARY: [
    { to: '/personnel/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/personnel/dashboard?tab=patients', icon: Users, label: 'Patients' },
    { to: '/personnel/dashboard?tab=rdv', icon: Calendar, label: 'Rendez-vous' },
    { to: '/personnel/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  INFIRMIER: [
    { to: '/infirmier/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/infirmier/dashboard?tab=transport', icon: Truck, label: 'Fiches transport' },
    { to: '/infirmier/dashboard?tab=soins', icon: Heart, label: 'Taches de soins' },
    { to: '/infirmier/dashboard?tab=hygiene', icon: ClipboardList, label: 'Taches hygiene' },
    { to: '/infirmier/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  BRANCARDIER: [
    { to: '/brancardier/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/brancardier/dashboard?tab=historique', icon: Clock, label: 'Historique transports' },
    { to: '/brancardier/dashboard?tab=planning', icon: Calendar, label: 'Mon planning' },
    { to: '/brancardier/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  AIDE_SOIGNANT: [
    { to: '/aide-soignant/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/aide-soignant/dashboard?tab=taches', icon: ClipboardList, label: 'Mes taches' },
    { to: '/aide-soignant/dashboard?tab=planning', icon: Calendar, label: 'Mon planning' },
    { to: '/aide-soignant/dashboard?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  CHEF_SERVICE: [
    { to: '/dashboard/chef', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/dashboard/chef?tab=medecins', icon: Stethoscope, label: 'Medecins' },
    { to: '/dashboard/chef?tab=appartenance', icon: UserCheck, label: 'Appartenance service' },
    { to: '/dashboard/chef?tab=creneaux', icon: Clock, label: 'Creneaux & planning' },
    { to: '/dashboard/chef?tab=stats', icon: BarChart3, label: 'Statistiques' },
    { to: '/dashboard/chef?tab=organigramme', icon: Network, label: 'Organigramme' },
    { to: '/dashboard/chef?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin?tab=users', icon: UserCog, label: 'Utilisateurs' },
    { to: '/admin?tab=personnel', icon: Users, label: 'Personnel' },
    { to: '/admin?tab=settings', icon: Settings, label: 'Parametres' },
  ],
  DIRECTEUR: [
    { to: '/directeur', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/directeur?tab=stats', icon: BarChart3, label: 'Statistiques' },
    { to: '/directeur?tab=patients', icon: Users, label: 'Patients' },
    { to: '/directeur?tab=medecins', icon: Stethoscope, label: 'Medecins' },
    { to: '/directeur?tab=rapports', icon: FileText, label: 'Rapports' },
    { to: '/directeur?tab=organigramme', icon: Network, label: 'Organigramme' },
    { to: '/directeur?tab=messages', icon: MessageSquare, label: 'Messagerie' },
  ],
}

const ROLE_LABELS = {
  MEDECIN: 'Medecin', INFIRMIER: 'Infirmier(e)', BRANCARDIER: 'Brancardier',
  AIDE_SOIGNANT: 'Aide Soignant', CHEF_SERVICE: 'Chef de Service',
  SECRETARY: 'Secretaire', ADMIN: 'Administrateur', DIRECTEUR: 'Directeur',
  PERSONNEL: 'Personnel', PATIENT: 'Patient',
}

const ROLE_COLORS = {
  MEDECIN: 'from-blue-600 to-blue-800',
  INFIRMIER: 'from-emerald-500 to-teal-700',
  BRANCARDIER: 'from-orange-500 to-orange-700',
  AIDE_SOIGNANT: 'from-purple-500 to-purple-700',
  CHEF_SERVICE: 'from-blue-700 to-indigo-800',
  SECRETARY: 'from-pink-500 to-rose-600',
  ADMIN: 'from-slate-600 to-slate-800',
  DIRECTEUR: 'from-indigo-600 to-indigo-800',
  PATIENT: 'from-teal-500 to-teal-700',
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menu = MENUS[user?.role] || []
  const roleColor = ROLE_COLORS[user?.role] || 'from-blue-600 to-blue-800'

  const [unread, setUnread] = useState(0)
  useEffect(() => {
    if (!user || user.role === 'PATIENT') return
    const fetchUnread = async () => {
      try {
        const res = await personnelMessagesApi.countNonLus()
        setUnread(res.data?.count || 0)
      } catch { }
    }
    fetchUnread()
    const t = setInterval(fetchUnread, 30000)
    return () => clearInterval(t)
  }, [user])

  const handleLogout = () => { logout(); navigate('/') }
  const handleNav = () => { if (onClose) onClose() }

  return (
    <aside className="w-64 flex flex-col h-screen sticky top-0 bg-white border-r border-slate-100 shadow-soft">
      {/* Logo */}
      <div className={`p-5 bg-gradient-to-br ${roleColor}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-white text-lg tracking-tight">MedSys</div>
            <div className="text-[10px] text-white/70 uppercase tracking-wider font-medium">
              {ROLE_LABELS[user?.role] || user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {menu.map((item) => {
          const isMessages = item.label === 'Messagerie' && user?.role !== 'PATIENT'
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={!item.to.includes('?')}
              onClick={handleNav}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    isActive ? 'bg-primary-100' : 'bg-transparent group-hover:bg-slate-100')}>
                    <item.icon className={cn('w-4 h-4', isActive ? 'text-primary-600' : 'text-slate-500')} strokeWidth={2} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isMessages && unread > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 mb-1 rounded-lg bg-slate-50">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{user?.prenom} {user?.nom}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut className="w-4 h-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  )
}
