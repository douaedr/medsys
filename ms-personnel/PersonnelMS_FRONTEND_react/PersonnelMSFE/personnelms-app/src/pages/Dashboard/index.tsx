import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, Calendar, Clock, UserX, TrendingUp, ChevronRight, Activity, ClipboardList } from 'lucide-react';
import { personnelService, planningService, absenceService, rapportService } from '../../services';
import { Skeleton } from '../../components/common';
import { STATUT_LABELS, StatutPlanning, STATUT_PLANNING_COLORS, STATUT_PLANNING_LABELS } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPersonnel: 0,
    planningsActifs: 0,
    absencesEnAttente: 0,
    creneauxAujourdhui: 0,
  });
  const [effectifData, setEffectifData] = useState<any[]>([]);
  const [absencesData, setAbsencesData] = useState<any[]>([]);
  const [repartitionData, setRepartitionData] = useState<any[]>([]);
  const [recentPlannings, setRecentPlannings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [personnelRes, planningsRes, absencesRes] = await Promise.allSettled([
        personnelService.getAll({ page: 1, taillePage: 1 }),
        planningService.getAll({ page: 1, taillePage: 5 }),
        absenceService.getEnAttente(),
      ]);

      if (personnelRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, totalPersonnel: personnelRes.value.data.total }));
      }
      if (planningsRes.status === 'fulfilled') {
        const plannings = planningsRes.value.data.items;
        setRecentPlannings(plannings);
        setStats(prev => ({
          ...prev,
          planningsActifs: plannings.filter((p: any) =>
            p.statut === StatutPlanning.PUBLIE || p.statut === StatutPlanning.VALIDE
          ).length,
        }));
      }
      if (absencesRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, absencesEnAttente: absencesRes.value.data.length }));
      }

      // Rapports
      const [effectifRes, absencesMoisRes, repartitionRes] = await Promise.allSettled([
        rapportService.effectifParService(),
        rapportService.absencesParMois(new Date().getFullYear()),
        rapportService.repartitionStatut(),
      ]);

      if (effectifRes.status === 'fulfilled') {
        const data = Array.isArray(effectifRes.value.data) ? effectifRes.value.data : [];
        setEffectifData(data.map((d: any) => ({
          service: d.service || d.name || 'Service',
          count: d.count || d.effectif || 0,
        })));
      }
      if (absencesMoisRes.status === 'fulfilled') {
        const data = Array.isArray(absencesMoisRes.value.data) ? absencesMoisRes.value.data : [];
        setAbsencesData(data.map((d: any) => ({
          mois: MOIS[(d.mois || 1) - 1],
          count: d.count || 0,
        })));
      }
      if (repartitionRes.status === 'fulfilled') {
        const data = Array.isArray(repartitionRes.value.data) ? repartitionRes.value.data : [];
        setRepartitionData(data.map((d: any) => ({
          name: STATUT_LABELS[d.statut as keyof typeof STATUT_LABELS] || 'Inconnu',
          value: d.count || 0,
        })));
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Total Personnel',
      value: stats.totalPersonnel,
      icon: <Users size={20} className="text-blue-600" />,
      bg: 'bg-blue-50',
      link: '/personnel',
      trend: '+3 ce mois',
    },
    {
      label: 'Plannings actifs',
      value: stats.planningsActifs,
      icon: <Calendar size={20} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
      link: '/plannings',
    },
    {
      label: 'Absences en attente',
      value: stats.absencesEnAttente,
      icon: <UserX size={20} className="text-amber-600" />,
      bg: 'bg-amber-50',
      link: '/absences',
    },
    {
      label: 'Créneaux actifs',
      value: stats.creneauxAujourdhui,
      icon: <Clock size={20} className="text-violet-600" />,
      bg: 'bg-violet-50',
      link: '/creneaux',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link to={card.link} key={i} className="stat-card hover:shadow-md transition-shadow group">
            <div className={`${card.bg} p-3 rounded-xl flex-shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              {loading ? (
                <Skeleton className="h-7 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              )}
              <div className="text-xs text-slate-500 truncate">{card.label}</div>
              {card.trend && (
                <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                  <TrendingUp size={11} />{card.trend}
                </div>
              )}
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 ml-auto flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Effectif par service */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Effectif par service
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-48" />
          ) : effectifData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={effectifData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Effectif" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Répartition par statut */}
        <div className="card p-5">
          <div className="section-title mb-4">Répartition statuts</div>
          {loading ? (
            <Skeleton className="h-48" />
          ) : repartitionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {repartitionData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Aucune donnée
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Absences par mois */}
        <div className="card p-5">
          <div className="section-title mb-4 flex items-center gap-2">
            <UserX size={18} className="text-amber-600" />
            Absences par mois ({new Date().getFullYear()})
          </div>
          {loading ? (
            <Skeleton className="h-40" />
          ) : absencesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={absencesData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Absences" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              Aucune donnée
            </div>
          )}
        </div>

        {/* Plannings récents */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-600" />
              Plannings récents
            </div>
            <Link to="/plannings" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : recentPlannings.length > 0 ? (
            <div className="space-y-2">
              {recentPlannings.slice(0, 5).map(p => (
                <Link
                  key={p.id}
                  to={`/plannings/${p.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600">{p.nom}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(p.dateDebut).toLocaleDateString('fr-FR')} — {new Date(p.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className={`badge ${STATUT_PLANNING_COLORS[p.statut as StatutPlanning]}`}>
                    {STATUT_PLANNING_LABELS[p.statut as StatutPlanning]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">Aucun planning</div>
          )}
        </div>
      </div>
    </div>
  );
}
