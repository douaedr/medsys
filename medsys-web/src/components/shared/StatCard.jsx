import { cn } from '../../lib/utils'

export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    accent:  'bg-accent-50 text-accent-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger:  'bg-red-50 text-red-600',
  }
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
            {label}
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
          {trend && (
            <div className={cn(
              'text-xs font-semibold mt-2',
              trend > 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% ce mois
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}