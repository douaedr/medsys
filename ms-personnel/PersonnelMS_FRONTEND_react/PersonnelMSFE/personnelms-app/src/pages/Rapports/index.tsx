import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { rapportService } from '../../services';
import { STATUT_LABELS, Statut } from '../../types';
import { PageHeader, Skeleton, Tabs } from '../../components/common';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const TABS = [
  { id: 'effectif', label: 'Effectif par service', icon: <Users size={14} /> },
  { id: 'absences', label: 'Absences par mois', icon: <Clock size={14} /> },
  { id: 'occupation', label: 'Taux d\'occupation', icon: <TrendingUp size={14} /> },
  { id: 'statut', label: 'Répartition statut', icon: <BarChart3 size={14} /> },
];

function StatCard({ title, value, subtitle, icon, color }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Rapports() {
  const [activeTab, setActiveTab] = useState('effectif');
  const [effectifData, setEffectifData] = useState<any[]>([]);
  const [absencesData, setAbsencesData] = useState<any[]>([]);
  const [tauxOccupation, setTauxOccupation] = useState<number>(0);
  const [repartitionData, setRepartitionData] = useState<any[]>([]);
  const [demandesCount, setDemandesCount] = useState<number>(0);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [annee]);

  async function loadAll() {
    setLoading(true);
    try {
      const [eff, abs, taux, rep, dem] = await Promise.allSettled([
        rapportService.effectifParService(),
        rapportService.absencesParMois(annee),
        rapportService.tauxOccupation(),
        rapportService.repartitionStatut(),
        rapportService.demandesEnAttente(),
      ]);

      if (eff.status === 'fulfilled') {
        const raw = Array.isArray(eff.value.data) ? eff.value.data : [];
        setEffectifData(raw.map((d: any) => ({
          service: d.service || d.poste || 'N/A',
          count: d.count ?? d.effectif ?? 0,
        })));
      }
      if (abs.status === 'fulfilled') {
        const raw = Array.isArray(abs.value.data) ? abs.value.data : [];
        // Fill all 12 months
        const byMonth: Record<number, number> = {};
        raw.forEach((d: any) => { byMonth[d.mois] = d.count ?? 0; });
        setAbsencesData(
          Array.from({ length: 12 }, (_, i) => ({
            mois: MOIS[i],
            absences: byMonth[i + 1] ?? 0,
          }))
        );
      }
      if (taux.status === 'fulfilled') {
        const raw = taux.value.data;
        setTauxOccupation(typeof raw === 'number' ? raw : (raw?.taux ?? 0));
      }
      if (rep.status === 'fulfilled') {
        const raw = Array.isArray(rep.value.data) ? rep.value.data : [];
        setRepartitionData(raw.map((d: any) => ({
          name: STATUT_LABELS[d.statut as Statut] ?? d.statut,
          value: d.count ?? 0,
        })));
      }
      if (dem.status === 'fulfilled') {
        const raw = dem.value.data;
        setDemandesCount(typeof raw === 'number' ? raw : (raw?.count ?? 0));
      }
    } finally {
      setLoading(false);
    }
  }

  const totalPersonnel = repartitionData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <PageHeader
        title="Rapports & Analyses"
        subtitle="Tableaux de bord et statistiques de l'établissement"
        actions={
          <button onClick={loadAll} className="btn-secondary">
            <RefreshCw size={15} />
            Actualiser
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total personnel"
          value={loading ? '...' : totalPersonnel}
          icon={<Users size={18} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Taux d'occupation"
          value={loading ? '...' : `${tauxOccupation}%`}
          subtitle="Tous créneaux"
          icon={<TrendingUp size={18} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          title="Absences {annee}"
          value={loading ? '...' : absencesData.reduce((s, d) => s + d.absences, 0)}
          subtitle={`Année ${annee}`}
          icon={<Clock size={18} className="text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="Demandes en attente"
          value={loading ? '...' : demandesCount}
          icon={<AlertCircle size={18} className="text-red-500" />}
          color="bg-red-50"
        />
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="px-6 pt-5">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="px-6 pb-6">
          {/* Effectif par service */}
          {activeTab === 'effectif' && (
            <div>
              <h3 className="section-title mb-4">Effectif par service / poste</h3>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : effectifData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <BarChart3 size={40} className="mb-2 opacity-30" />
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={effectifData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                      formatter={(val) => [val, 'Effectif']}
                    />
                    <Bar dataKey="count" name="Effectif" radius={[4, 4, 0, 0]}>
                      {effectifData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Absences par mois */}
          {activeTab === 'absences' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Absences par mois</h3>
                <select
                  value={annee}
                  onChange={e => setAnnee(parseInt(e.target.value))}
                  className="select-field w-28"
                >
                  {[2023, 2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={absencesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                      formatter={(val) => [val, 'Absences']}
                    />
                    <Bar dataKey="absences" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Absences" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Taux d'occupation */}
          {activeTab === 'occupation' && (
            <div>
              <h3 className="section-title mb-6">Taux d'occupation global</h3>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <ResponsiveContainer width={280} height={280}>
                      <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius="60%" outerRadius="90%"
                        data={[{ name: 'Occupation', value: Math.min(tauxOccupation, 100), fill: '#3b82f6' }]}
                        startAngle={90} endAngle={-270}
                      >
                        <RadialBar dataKey="value" background={{ fill: '#f1f5f9' }} cornerRadius={8} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {tauxOccupation}%
                      </span>
                      <span className="text-xs text-slate-400 mt-1">Taux d'occupation</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    tauxOccupation >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : tauxOccupation >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tauxOccupation >= 80 ? '✓ Occupation optimale' : tauxOccupation >= 50 ? '⚠ Occupation modérée' : '✗ Occupation faible'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Répartition statut */}
          {activeTab === 'statut' && (
            <div>
              <h3 className="section-title mb-4">Répartition du personnel par statut</h3>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : repartitionData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <BarChart3 size={40} className="mb-2 opacity-30" />
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={repartitionData}
                        cx="50%" cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {repartitionData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend formatter={(val) => <span style={{ fontSize: 12, color: '#64748b' }}>{val}</span>} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                        formatter={(val, name) => [val, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3 min-w-40">
                    {repartitionData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-slate-600">{d.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
