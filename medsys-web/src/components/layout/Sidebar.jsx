import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { personnelMessagesApi } from "../../api/api"
import {
  LayoutDashboard, Users, Calendar, FileText, MessageSquare,
  Settings, LogOut, Stethoscope, UserCog, BarChart3, Activity, User,
  FolderOpen, Clock, ClipboardList, Network, UserCheck
} from "lucide-react"
import { cn } from "../../lib/utils"

const MENUS = {
  PATIENT: [
    { to: "/patient/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/patient/dashboard?tab=dossier", icon: FileText, label: "Mon dossier" },
    { to: "/patient/dashboard?tab=rdv", icon: Calendar, label: "Mes rendez-vous" },
    { to: "/patient/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
    { to: "/patient/dashboard?tab=documents", icon: FolderOpen, label: "Mes documents" },
    { to: "/patient/dashboard?tab=profil", icon: User, label: "Mon profil" },
    { to: "/patient/dashboard?tab=attente", icon: Clock, label: "Liste d-attente" },
  ],
  MEDECIN: [
    { to: "/personnel/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/personnel/dashboard?tab=patients", icon: Users, label: "Patients" },
    { to: "/personnel/dashboard?tab=consultations", icon: Stethoscope, label: "Consultations" },
    { to: "/personnel/dashboard?tab=rdv", icon: Calendar, label: "Rendez-vous" },
    { to: "/personnel/dashboard?tab=dossier", icon: FileText, label: "Dossiers medicaux" },
    { to: "/personnel/dashboard?tab=planning", icon: Clock, label: "Mon planning" },
    { to: "/personnel/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  PERSONNEL: [
    { to: "/personnel/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/personnel/dashboard?tab=taches", icon: ClipboardList, label: "Mes taches" },
    { to: "/personnel/dashboard?tab=patients", icon: Users, label: "Patients" },
    { to: "/personnel/dashboard?tab=rdv", icon: Calendar, label: "Rendez-vous" },
    { to: "/personnel/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  SECRETARY: [
    { to: "/personnel/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/personnel/dashboard?tab=patients", icon: Users, label: "Patients" },
    { to: "/personnel/dashboard?tab=rdv", icon: Calendar, label: "Rendez-vous" },
    { to: "/personnel/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  INFIRMIER: [
    { to: "/infirmier/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/infirmier/dashboard?tab=fiches", icon: FileText, label: "Mes fiches transport" },
    { to: "/infirmier/dashboard?tab=planning", icon: Clock, label: "Mon planning" },
    { to: "/infirmier/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  BRANCARDIER: [
    { to: "/brancardier/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/brancardier/dashboard?tab=historique", icon: Clock, label: "Historique transports" },
    { to: "/brancardier/dashboard?tab=planning", icon: Clock, label: "Mon planning" },
    { to: "/brancardier/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  AIDE_SOIGNANT: [
    { to: "/personnel/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/personnel/dashboard?tab=taches", icon: ClipboardList, label: "Mes taches" },
    { to: "/personnel/dashboard?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  CHEF_SERVICE: [
    { to: "/dashboard/chef", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/dashboard/chef?tab=medecins", icon: Stethoscope, label: "Medecins" },
    { to: "/dashboard/chef?tab=appartenance", icon: UserCheck, label: "Appartenance service" },
    { to: "/dashboard/chef?tab=creneaux", icon: Clock, label: "Creneaux & planning" },
    { to: "/dashboard/chef?tab=stats", icon: BarChart3, label: "Statistiques" },
    { to: "/dashboard/chef?tab=organigramme", icon: Network, label: "Organigramme" },
    { to: "/dashboard/chef?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
  ADMIN: [
    { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/admin?tab=users", icon: UserCog, label: "Utilisateurs" },
    { to: "/admin?tab=personnel", icon: Users, label: "Personnel" },
    { to: "/admin?tab=settings", icon: Settings, label: "Parametres" },
  ],
  DIRECTEUR: [
    { to: "/directeur", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/directeur?tab=stats", icon: BarChart3, label: "Statistiques" },
    { to: "/directeur?tab=patients", icon: Users, label: "Patients" },
    { to: "/directeur?tab=medecins", icon: Stethoscope, label: "Medecins" },
    { to: "/directeur?tab=rapports", icon: FileText, label: "Rapports" },
    { to: "/directeur?tab=organigramme", icon: Network, label: "Organigramme" },
    { to: "/directeur?tab=messages", icon: MessageSquare, label: "Messagerie" },
  ],
}

// Couleur sidebar par role
const ROLE_THEME = {
  MEDECIN:      { bg: "bg-blue-900",    active: "bg-blue-700 text-white",   hover: "hover:bg-blue-800 text-blue-100",   text: "text-blue-100",   logo: "from-blue-400 to-blue-600",   badge: "bg-blue-500" },
  INFIRMIER:    { bg: "bg-emerald-800", active: "bg-emerald-600 text-white", hover: "hover:bg-emerald-700 text-emerald-100", text: "text-emerald-100", logo: "from-emerald-400 to-emerald-600", badge: "bg-emerald-500" },
  BRANCARDIER:  { bg: "bg-orange-700",  active: "bg-orange-500 text-white",  hover: "hover:bg-orange-600 text-orange-100",  text: "text-orange-100",  logo: "from-orange-400 to-orange-600",  badge: "bg-orange-400" },
  AIDE_SOIGNANT:{ bg: "bg-purple-900",  active: "bg-purple-700 text-white",  hover: "hover:bg-purple-800 text-purple-100",  text: "text-purple-100",  logo: "from-purple-400 to-purple-600",  badge: "bg-purple-500" },
  CHEF_SERVICE: { bg: "bg-teal-800",    active: "bg-teal-600 text-white",    hover: "hover:bg-teal-700 text-teal-100",    text: "text-teal-100",    logo: "from-teal-400 to-teal-600",    badge: "bg-teal-500" },
  SECRETARY:    { bg: "bg-pink-800",    active: "bg-pink-600 text-white",    hover: "hover:bg-pink-700 text-pink-100",    text: "text-pink-100",    logo: "from-pink-400 to-pink-600",    badge: "bg-pink-500" },
  ADMIN:        { bg: "bg-slate-900",   active: "bg-slate-700 text-white",   hover: "hover:bg-slate-800 text-slate-100",   text: "text-slate-100",   logo: "from-slate-400 to-slate-600",   badge: "bg-slate-500" },
  DIRECTEUR:    { bg: "bg-indigo-900",  active: "bg-indigo-700 text-white",  hover: "hover:bg-indigo-800 text-indigo-100",  text: "text-indigo-100",  logo: "from-indigo-400 to-indigo-600",  badge: "bg-indigo-500" },
  PERSONNEL:    { bg: "bg-cyan-800",    active: "bg-cyan-600 text-white",    hover: "hover:bg-cyan-700 text-cyan-100",    text: "text-cyan-100",    logo: "from-cyan-400 to-cyan-600",    badge: "bg-cyan-500" },
  PATIENT:      { bg: "bg-white",       active: "bg-primary-50 text-primary-700", hover: "hover:bg-slate-50 text-slate-900", text: "text-slate-600", logo: "from-primary-500 to-primary-700", badge: "bg-red-500" },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menu = MENUS[user?.role] || []
  const theme = ROLE_THEME[user?.role] || ROLE_THEME.PATIENT
  const isLight = user?.role === "PATIENT"

  const [unread, setUnread] = useState(0)
  useEffect(() => {
    if (!user || user.role === "PATIENT") return
    const fetchUnread = async () => {
      try {
        const res = await personnelMessagesApi.countNonLus()
        setUnread(res.data?.count || 0)
      } catch {}
    }
    fetchUnread()
    const t = setInterval(fetchUnread, 30000)
    return () => clearInterval(t)
  }, [user])

  const handleLogout = () => { logout(); navigate("/") }

  return (
    <aside className={cn("w-64 flex flex-col h-screen sticky top-0", theme.bg, isLight ? "border-r border-slate-200" : "")}>
      {/* Logo */}
      <div className={cn("p-5", isLight ? "border-b border-slate-200" : "border-b border-white/10")}>
        <div className="flex items-center gap-2.5">
          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", theme.logo)}>
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className={cn("font-bold tracking-tight", isLight ? "text-slate-900" : "text-white")}>MedSys</div>
            <div className={cn("text-[10px] uppercase tracking-wider font-semibold opacity-70", isLight ? "text-slate-500" : "text-white")}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menu.map((item) => {
          const isMessages = item.label === "Messagerie" && user?.role !== "PATIENT"
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={!item.to.includes("?")}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all",
                  isActive ? theme.active : cn(theme.hover, theme.text)
                )
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {isMessages && unread > 0 && (
                <span className={cn("ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white", theme.badge)}>
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User footer */}
      <div className={cn("p-3", isLight ? "border-t border-slate-200" : "border-t border-white/10")}>
        <div className="flex items-center gap-3 p-2 mb-2">
          <div className={cn("w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold", theme.logo)}>
            {(user?.prenom?.[0] || "") + (user?.nom?.[0] || "")}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn("text-sm font-semibold truncate", isLight ? "text-slate-900" : "text-white")}>{user?.prenom} {user?.nom}</div>
            <div className={cn("text-xs truncate opacity-60", isLight ? "text-slate-500" : "text-white")}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            isLight ? "text-slate-600 hover:bg-red-50 hover:text-red-600" : "text-white/70 hover:bg-white/10 hover:text-white"
          )}>
          <LogOut className="w-4 h-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  )
}
