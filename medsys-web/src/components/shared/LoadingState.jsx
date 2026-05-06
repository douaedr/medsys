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
