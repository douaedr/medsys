import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PlanningHebdo from '../../components/planning/PlanningHebdo'
import { Calendar, RefreshCw } from 'lucide-react'

export default function MonEmploiDuTemps() {
  const { user, token } = useAuth()
  const personnelId = user?.personnelId || user?.id
  const [creneaux, setCreneaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8081/api/chef/edt/personnel/${personnelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Chef-Id': String(personnelId)
        }
      })
      const data = res.ok ? await res.json() : []
      const mapped = Array.isArray(data) ? data.map(c => ({...c, jour: c.jourSemaine, type: c.activite})) : []
      setCreneaux(mapped)
    } catch (e) {
      setError("Impossible de charger votre emploi du temps.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Mon emploi du temps
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Planning hebdomadaire défini par le chef de service
          </p>
        </div>
        <button
          onClick={load}
          className="btn-ghost btn-sm flex items-center gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={load} className="btn-outline btn-sm">Réessayer</button>
        </div>
      ) : creneaux.length === 0 ? (
        <div className="py-12 text-center">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">Aucun créneau planifié</p>
          <p className="text-sm text-slate-400 mt-1">
            Votre chef de service n'a pas encore défini de créneaux pour vous.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-slate-500">
            {creneaux.length} créneau(x) cette semaine
          </div>
          <PlanningHebdo creneaux={creneaux} readOnly={true} />
        </>
      )}
    </div>
  )
}
