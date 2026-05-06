import { cn } from '../../lib/utils'
export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const configs = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-100' },
    accent:  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    warning: { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
    danger:  { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100' },
  }
  const c = configs[color] || configs.primary
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 hover:shadow-card transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">{label}</div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{value ?? '-'}</div>
          {trend !== undefined && (
            <div className={cn('text-xs font-semibold mt-2 flex items-center gap-1', trend > 0 ? 'text-emerald-600' : 'text-red-500')}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% ce mois</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border', c.bg, c.border)}>
          <Icon className={cn('w-5 h-5', c.text)} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
