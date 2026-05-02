import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/api'
import {
  Activity, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2,
  LogIn, UserPlus, Lock, User, Calendar, Phone,
  Droplet, FileText, Plus, Trash2, Heart
} from 'lucide-react'

const STEPS = [
  { label: 'Compte',      icon: Lock },
  { label: 'Identité',    icon: User },
  { label: 'Santé',       icon: Droplet },
  { label: 'Antécédents', icon: FileText },
]

const GROUPES_SANGUINS = [
  'A_POSITIF','A_NEGATIF','B_POSITIF','B_NEGATIF',
  'AB_POSITIF','AB_NEGATIF','O_POSITIF','O_NEGATIF'
]
const LABEL_GS = {
  A_POSITIF:'A+', A_NEGATIF:'A−', B_POSITIF:'B+', B_NEGATIF:'B−',
  AB_POSITIF:'AB+', AB_NEGATIF:'AB−', O_POSITIF:'O+', O_NEGATIF:'O−',
}
const TYPES_ANTECEDENT = ['MEDICAL','CHIRURGICAL','FAMILIAL','ALLERGIE']

export default function PatientPortalPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [reg, setReg] = useState({
    email:'', password:'', confirmPassword:'',
    nom:'', prenom:'', cin:'', dateNaissance:'', sexe:'MASCULIN',
    telephone:'', adresse:'', ville:'',
    groupeSanguin:'', mutuelle:'', numeroCNSS:'',
    antecedents: [],
  })

  const updateReg = (f, v) => setReg(p => ({ ...p, [f]: v }))

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await authApi.login(loginForm)
      const data = res.data
      if (data.role !== 'PATIENT') { setError('Ce portail est réservé aux patients.'); return }
      login(data, data.token)
      navigate('/patient/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.')
    } finally { setLoading(false) }
  }

  // ── Register ──
  const handleRegister = async () => {
    setError(''); setLoading(true)
    try {
      const body = {
        email: reg.email, password: reg.password,
        nom: reg.nom, prenom: reg.prenom, cin: reg.cin,
        dateNaissance: reg.dateNaissance, sexe: reg.sexe,
        telephone: reg.telephone, adresse: reg.adresse, ville: reg.ville,
        groupeSanguin: reg.groupeSanguin || null,
        mutuelle: reg.mutuelle || null, numeroCNSS: reg.numeroCNSS || null,
        antecedents: reg.antecedents.length > 0 ? reg.antecedents : null,
      }
      const res = await authApi.register(body)
      const data = res.data
      login(data, data.token)
      navigate('/patient/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.")
    } finally { setLoading(false) }
  }

  // ── Validation ──
  const validateStep = () => {
    setError('')
    if (step === 0) {
      if (!reg.email || !reg.password) return setError('Email et mot de passe obligatoires.')
      if (reg.password.length < 8) return setError('Minimum 8 caractères.')
      if (reg.password !== reg.confirmPassword) return setError('Les mots de passe ne correspondent pas.')
    }
    if (step === 1) {
      if (!reg.nom || !reg.prenom || !reg.cin || !reg.dateNaissance)
        return setError('Nom, prénom, CIN et date de naissance obligatoires.')
    }
    return true
  }
  const nextStep = () => { if (validateStep() === true) { if (step < STEPS.length - 1) setStep(step + 1); else handleRegister() } }
  const prevStep = () => { if (step > 0) { setStep(step - 1); setError('') } }

  // ── Antecedents ──
  const addAntecedent = () => updateReg('antecedents', [...reg.antecedents, { type:'MEDICAL', description:'', dateApparition:'', actif:true }])
  const removeAntecedent = (i) => updateReg('antecedents', reg.antecedents.filter((_,idx) => idx !== i))
  const updateAntecedent = (i, f, v) => { const c = [...reg.antecedents]; c[i] = { ...c[i], [f]: v }; updateReg('antecedents', c) }

  return (
    <div className="min-h-screen flex">
      {/* ═══ LEFT PANEL — Visual (same style as PersonnelLoginPage) ═══ */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />

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
              Votre santé,<br />notre priorité
            </h2>
            <p className="text-lg opacity-90 max-w-md leading-relaxed">
              Accédez à votre dossier médical, prenez rendez-vous
              et communiquez avec votre équipe soignante en toute simplicité.
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> Dossier médical</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Rendez-vous</div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Ordonnances</div>
            </div>
          </div>

          <div className="text-sm opacity-80">
            © 2026 MedSys — Sécurisé et conforme RGPD
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">MedSys</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Portail Patient</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            {mode === 'login' ? 'Connexion patient' : 'Créer un compte'}
          </h1>
          <p className="text-slate-500 mb-6">
            {mode === 'login'
              ? 'Accédez à votre espace santé personnel'
              : `Étape ${step + 1}/${STEPS.length} — ${STEPS[step].label}`}
          </p>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-6">
            <button onClick={() => { setMode('login'); setError(''); setStep(0) }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              <LogIn className="w-4 h-4" /> Connexion
            </button>
            <button onClick={() => { setMode('register'); setError(''); setStep(0) }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === 'register' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              <UserPlus className="w-4 h-4" /> Inscription
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {/* ════════════ LOGIN ════════════ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required value={loginForm.email}
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="votre@email.com" />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="input pr-10" required
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link to="/reset-password" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                  Mot de passe oublié ?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</> : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ════════════ REGISTER (multi-step) ════════════ */}
          {mode === 'register' && (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-1 mb-6">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      i < step ? 'bg-emerald-500 text-white'
                      : i === step ? 'bg-primary-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                    }`}>
                      {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 rounded-full ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── Step 0: Compte ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" className="input" required value={reg.email}
                      onChange={e => updateReg('email', e.target.value)} placeholder="votre@email.com" />
                  </div>
                  <div>
                    <label className="label">Mot de passe *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} className="input pr-10" required
                        value={reg.password} onChange={e => updateReg('password', e.target.value)}
                        placeholder="Minimum 8 caractères" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirmer *</label>
                    <input type="password" className="input" required value={reg.confirmPassword}
                      onChange={e => updateReg('confirmPassword', e.target.value)} placeholder="Retapez le mot de passe" />
                  </div>
                </div>
              )}

              {/* ── Step 1: Identité ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Nom *</label>
                      <input className="input" required value={reg.nom} onChange={e => updateReg('nom', e.target.value)} /></div>
                    <div><label className="label">Prénom *</label>
                      <input className="input" required value={reg.prenom} onChange={e => updateReg('prenom', e.target.value)} /></div>
                  </div>
                  <div><label className="label">CIN *</label>
                    <input className="input" required value={reg.cin} onChange={e => updateReg('cin', e.target.value)} placeholder="ex: AB123456" /></div>
                  <div><label className="label">Date de naissance *</label>
                    <input type="date" className="input" required value={reg.dateNaissance} onChange={e => updateReg('dateNaissance', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Sexe</label>
                      <select className="input" value={reg.sexe} onChange={e => updateReg('sexe', e.target.value)}>
                        <option value="MASCULIN">Masculin</option>
                        <option value="FEMININ">Féminin</option>
                      </select></div>
                    <div><label className="label">Téléphone</label>
                      <input className="input" value={reg.telephone} onChange={e => updateReg('telephone', e.target.value)} placeholder="06..." /></div>
                  </div>
                  <div><label className="label">Adresse</label>
                    <input className="input" value={reg.adresse} onChange={e => updateReg('adresse', e.target.value)} /></div>
                  <div><label className="label">Ville</label>
                    <input className="input" value={reg.ville} onChange={e => updateReg('ville', e.target.value)} /></div>
                </div>
              )}

              {/* ── Step 2: Santé ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Groupe sanguin</label>
                    <div className="grid grid-cols-4 gap-2">
                      {GROUPES_SANGUINS.map(gs => (
                        <button key={gs} type="button"
                          onClick={() => updateReg('groupeSanguin', reg.groupeSanguin === gs ? '' : gs)}
                          className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                            reg.groupeSanguin === gs
                              ? 'bg-red-50 border-red-400 text-red-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'
                          }`}>
                          {LABEL_GS[gs]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="label">Mutuelle</label>
                    <input className="input" value={reg.mutuelle} onChange={e => updateReg('mutuelle', e.target.value)}
                      placeholder="ex: CNOPS, CNSS, AMO..." /></div>
                  <div><label className="label">N° CNSS</label>
                    <input className="input" value={reg.numeroCNSS} onChange={e => updateReg('numeroCNSS', e.target.value)}
                      placeholder="Optionnel" /></div>
                </div>
              )}

              {/* ── Step 3: Antécédents ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Ajoutez vos antécédents médicaux si vous en avez. Cette étape est optionnelle.
                  </p>
                  {reg.antecedents.map((ant, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2 relative bg-slate-50">
                      <button type="button" onClick={() => removeAntecedent(i)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-slate-500">Type</label>
                          <select value={ant.type} onChange={e => updateAntecedent(i, 'type', e.target.value)} className="input">
                            {TYPES_ANTECEDENT.map(t => <option key={t} value={t}>{t}</option>)}
                          </select></div>
                        <div><label className="text-xs text-slate-500">Date</label>
                          <input type="date" value={ant.dateApparition || ''} onChange={e => updateAntecedent(i, 'dateApparition', e.target.value || null)} className="input" /></div>
                      </div>
                      <div><label className="text-xs text-slate-500">Description</label>
                        <input value={ant.description} onChange={e => updateAntecedent(i, 'description', e.target.value)}
                          className="input" placeholder="ex: Allergie à la pénicilline" /></div>
                    </div>
                  ))}
                  <button type="button" onClick={addAntecedent}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Ajouter un antécédent
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button type="button" onClick={prevStep}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                )}
                <button type="button" onClick={nextStep} disabled={loading}
                  className="flex-1 btn-primary btn-lg flex items-center justify-center gap-1.5">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</>
                    : step === STEPS.length - 1 ? <><Check className="w-4 h-4" /> Créer mon compte</>
                    : <>Continuer <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login/personnel" className="text-sm text-slate-500 hover:text-primary-600 font-medium">
              Accès personnel médical →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
