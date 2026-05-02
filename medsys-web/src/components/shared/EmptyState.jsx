export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-12 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">{description}</p>}
      {action}
    </div>
  )
}
