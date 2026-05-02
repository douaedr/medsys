import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/api'
import { Activity, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function PersonnelLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      // 🔧 FIX: backend renvoie un AuthResponse PLAT (token, role, email...)
      const data = res.data
      const user = {
        userId: data.userId,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        patientId: data.patientId,
        personnelId: data.personnelId,
        emailVerified: data.emailVerified,
      }
      login(user, data.token)

      // 🔧 FIX: SECRETARY ajouté dans la liste des rôles redirigés vers /personnel/dashboard
      if (data.role === 'ADMIN') navigate('/admin')
      else if (data.role === 'DIRECTEUR') navigate('/directeur')
      else if (['MEDECIN', 'PERSONNEL', 'SECRETARY'].includes(data.role)) navigate('/personnel/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-lg">MedSys</div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Hospital Management</div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Espace personnel<br />soignant
            </h2>
            <p className="text-lg opacity-90 max-w-md leading-relaxed">
              Accédez à vos outils professionnels pour gérer patients, consultations
              et dossiers médicaux en toute sécurité.
            </p>
          </div>
          <div className="text-sm opacity-80">
            © 2026 MedSys — Sécurisé et conforme RGPD
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Connexion personnel
          </h1>
          <p className="text-slate-500 mb-8">
            Identifiez-vous avec vos identifiants professionnels
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email professionnel</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.martin@hospital.ma"
                required
              />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</> : 'Se connecter'}
            </button>

            <div className="text-center text-sm">
              <Link to="/reset-password" className="text-primary-600 hover:text-primary-700 font-semibold">
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
