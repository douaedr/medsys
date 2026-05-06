import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import GestionEmploiDuTemps from '../chef/GestionEmploiDuTemps'
import AppartenanceService from '../chef/AppartenanceService'
import MessagesPanel from '../../components/messages/MessagesPanel'
import OrganigrammeView from '../../components/messages/OrganigrammeView'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useTab } from '../../lib/useTab'
import { Users, Calendar, Activity, Clock } from 'lucide-react'

const API = 'http://localhost:8081'

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
  }
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value ?? '-'}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

function useChefData() {
  const { user, token } = useAuth()
  const chefId = user?.personnelId || user?.id
  const [stats, setStats] = useState(null)
  const [medecins, setMedecins] = useState([])
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)

  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Chef-Id': String(chefId)
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/v1/chef/stats`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/api/v1/chef/medecins`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API}/api/v1/chef/service`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([s, m, svc]) => {
      setStats(s)
      setMedecins(Array.isArray(m) ? m : [])
      setService(svc)
      setLoading(false)
    })
  }, [])

  return { stats, medecins, service, loading }
}

function TableauDeBord() {
  const { stats, medecins, service, loading } = useChefData()
  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
  return (
    <div className="space-y-6">
      {service && (
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <div className="font-bold text-blue-900 text-lg">{service.nom}</div>
              {service.capaciteLits && <div className="text-sm text-blue-600">Capacite : {service.capaciteLits} lits</div>}
            </div>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Medecins du service" value={stats?.nombreMedecins ?? medecins.length} color="blue" />
        <StatCard icon={Calendar} label="Creneaux actifs" value={stats?.nombreCreneauxActifs ?? 0} color="green" />
        <StatCard icon={Activity} label="RDV aujourd'hui" value={stats?.nombreRdvAujourdhui ?? 0} color="amber" />
        <StatCard icon={Clock} label="Consultations" value={stats?.nombreConsultations ?? 0} color="purple" />
      </div>
      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Medecins du service</h3>
          <p className="text-sm text-slate-500 mt-0.5">{medecins.length} medecin(s)</p>
        </div>
        {medecins.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Aucun medecin trouve.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Medecin</th>
                <th className="px-6 py-3">Specialite</th>
                <th className="px-6 py-3">Matricule</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medecins.map((m, i) => (
                <tr key={m.id || i} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">Dr. {m.prenom} {m.nom}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{m.specialite || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{m.matricule || '-'}</td>
                  <td className="px-6 py-4">
                    {m.estChef
                      ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Chef de service</span>
                      : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Medecin</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Medecins() {
  const { medecins, service, loading } = useChefData()
  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
  return (
    <div className="space-y-6">
      {service && (
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div className="font-bold text-blue-900 text-lg">Service : {service.nom}</div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Liste des medecins</h3>
          <p className="text-sm text-slate-500">{medecins.length} medecin(s) dans ce service</p>
        </div>
        {medecins.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Aucun medecin trouve.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {medecins.map((m, i) => (
              <div key={m.id || i} className="p-6 flex items-center gap-4 hover:bg-slate-50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Dr. {m.prenom} {m.nom}</div>
                  <div className="text-sm text-slate-500">{m.specialite || '-'} · Matricule : {m.matricule || '-'}</div>
                </div>
                {m.estChef
                  ? <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700">Chef de service</span>
                  : <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">Medecin</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Statistiques() {
  const { stats, medecins, service, loading } = useChefData()
  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
  return (
    <div className="space-y-6">
      {service && (
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <div className="font-bold text-blue-900 text-lg">{service.nom}</div>
              {service.capaciteLits && <div className="text-sm text-blue-600">Capacite : {service.capaciteLits} lits</div>}
            </div>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Activite du service</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Medecins</span>
              <span className="font-bold text-blue-600">{stats?.nombreMedecins ?? medecins.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Creneaux actifs</span>
              <span className="font-bold text-emerald-600">{stats?.nombreCreneauxActifs ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">RDV aujourd'hui</span>
              <span className="font-bold text-amber-600">{stats?.nombreRdvAujourdhui ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Consultations totales</span>
              <span className="font-bold text-purple-600">{stats?.nombreConsultations ?? 0}</span>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Capacite</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Lits disponibles</span>
              <span className="font-bold text-blue-600">{service?.capaciteLits ?? '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Code service</span>
              <span className="font-bold text-slate-900">{service?.code ?? '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChefServiceDashboard() {
  const { user } = useAuth()
  const [tab] = useTab('dashboard')

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Espace Chef de Service</h1>
            <p className="text-gray-500 text-sm">Bienvenue, {user?.prenom} {user?.nom}</p>
          </div>
        </div>
        <div className="min-h-96">
          {tab === 'dashboard' && <TableauDeBord />}
          {tab === 'medecins' && <Medecins />}
          {tab === 'stats' && <Statistiques />}
          {tab === 'creneaux' && <GestionEmploiDuTemps />}
          {tab === 'appartenance' && <AppartenanceService />}
          {tab === 'messages' && <MessagesPanel />}
          {tab === 'organigramme' && <OrganigrammeView />}
        </div>
      </div>
    </DashboardLayout>
  )
}