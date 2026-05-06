import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeft, Home } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  const navigate = useNavigate()
  usePageTitle('Page introuvable')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* 404 */}
        <div className="text-8xl font-bold text-white/20 mb-4 tracking-tight">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou vous n'avez pas les droits pour y acceder.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all">
            <Home className="w-4 h-4" />
            Accueil
          </button>
        </div>
      </div>
    </div>
  )
}
