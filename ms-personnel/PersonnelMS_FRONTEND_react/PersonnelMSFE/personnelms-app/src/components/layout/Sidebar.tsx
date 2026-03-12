import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Heart, Truck, FileText,
  UserCog, Users2, Calendar, Clock, UserX, ClipboardEdit,
  BarChart3, ChevronDown, ChevronRight, Menu, X, Activity,
  Stethoscope, Building2
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navConfig: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  {
    path: '/personnel',
    label: 'Personnel',
    icon: <Users size={16} />,
    children: [
      { path: '/personnel', label: 'Tous', icon: <Users size={16} /> },
      { path: '/medecins', label: 'Médecins', icon: <Stethoscope size={16} /> },
      { path: '/infirmiers', label: 'Infirmiers', icon: <Heart size={16} /> },
      { path: '/aides-soignants', label: 'Aides-soignants', icon: <UserCheck size={16} /> },
      { path: '/brancardiers', label: 'Brancardiers', icon: <Truck size={16} /> },
      { path: '/secretaires', label: 'Secrétaires', icon: <FileText size={16} /> },
      { path: '/directeurs', label: 'Directeurs', icon: <UserCog size={16} /> },
    ],
  },
  { path: '/equipes', label: 'Équipes', icon: <Users2 size={16} /> },
  { path: '/plannings', label: 'Plannings', icon: <Calendar size={16} /> },
  { path: '/creneaux', label: 'Créneaux', icon: <Clock size={16} /> },
  {
    path: '/demandes',
    label: 'Demandes',
    icon: <ClipboardEdit size={16} />,
    children: [
      { path: '/absences', label: 'Absences', icon: <UserX size={16} /> },
      { path: '/demandes-modification', label: 'Modifications', icon: <ClipboardEdit size={16} /> },
    ],
  },
  { path: '/rapports', label: 'Rapports', icon: <BarChart3 size={16} /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(
    item.children?.some(c => location.pathname === c.path) || location.pathname === item.path
  );

  const isActive = location.pathname === item.path;

  if (item.children) {
    const hasActiveChild = item.children.some(c => location.pathname === c.path);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            hasActiveChild ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-3">
            {item.icon}
            {item.label}
          </span>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {expanded && (
          <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
            {item.children.map(child => (
              <NavItemComponent key={child.path} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — static in flex layout on lg+, slide-over on mobile */}
      <aside
        className={`
          flex-shrink-0 w-64 bg-white border-r border-slate-100 flex flex-col
          lg:relative lg:translate-x-0 lg:z-auto
          fixed top-0 left-0 h-full z-30 transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                PersonnelMS
              </div>
              <div className="text-xs text-slate-400">Gestion hospitalière</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
          {navConfig.map(item => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate">Hôpital Central</div>
              <div className="text-xs text-slate-400">Admin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-400 hidden sm:block">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
