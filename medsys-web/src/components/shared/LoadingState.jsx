export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-slate-200 rounded-full w-24 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded-full w-16 mb-2"></div>
          <div className="h-2 bg-slate-100 rounded-full w-20"></div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded-full w-1/3"></div>
        <div className="h-2 bg-slate-100 rounded-full w-1/2"></div>
      </div>
      <div className="h-3 bg-slate-200 rounded-full w-16"></div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
      <div className="p-5 border-b border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-full w-40"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={5} />
    </div>
  )
}

export default function LoadingState({ message = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  )
}
