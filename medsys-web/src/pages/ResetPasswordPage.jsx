import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../api/api'
import { Activity, ArrowLeft, Check, KeyRound, Loader2, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [form, setForm] = useState({ token: token || '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return setError('Les mots de passe ne correspondent pas')
    if (form.newPassword.length < 8) return setError('Minimum 8 caractères')
    setLoading(true); setError('')
    try {
      await authApi.resetPassword({ token: form.token, newPassword: form.newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Token invalide ou expiré')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Nouveau mot de passe
              </h1>
              <p className="text-xs text-slate-500">Définissez un nouveau mot de passe sécurisé</p>
            </div>
          </div>

          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-800 flex items-start gap-3">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Mot de passe modifié avec succès</div>
                <div className="text-xs opacity-80">Redirection dans 3 secondes…</div>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!token && (
                  <div>
                    <label className="label">Token de réinitialisation</label>
                    <input
                      className="input"
                      value={form.token}
                      onChange={e => setForm({ ...form, token: e.target.value })}
                      placeholder="Collez le token reçu par email"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="label">Nouveau mot de passe</label>
                  <input
                    type="password" className="input"
                    placeholder="Min. 8 caractères"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Confirmer le mot de passe</label>
                  <input
                    type="password" className="input"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Réinitialisation…</>
                    : <><Lock className="w-4 h-4" /> Réinitialiser le mot de passe</>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 justify-center mt-6 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5" />
          <span>MedSys — Sécurité garantie</span>
        </div>
      </div>
    </div>
  )
}