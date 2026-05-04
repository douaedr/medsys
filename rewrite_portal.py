content = r"""import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authApi } from "../api/api"
import {
  Activity, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2,
  LogIn, UserPlus, Lock, User, Droplet, FileText, Plus, Trash2, Upload
} from "lucide-react"

const STEPS = [
  { label: "Compte",      icon: Lock },
  { label: "Identite",    icon: User },
  { label: "Sante",       icon: Droplet },
  { label: "Antecedents", icon: FileText },
  { label: "Documents",   icon: Upload },
]

const GROUPES_SANGUINS = ["A_POSITIF","A_NEGATIF","B_POSITIF","B_NEGATIF","AB_POSITIF","AB_NEGATIF","O_POSITIF","O_NEGATIF"]
const LABEL_GS = { A_POSITIF:"A+", A_NEGATIF:"A-", B_POSITIF:"B+", B_NEGATIF:"B-", AB_POSITIF:"AB+", AB_NEGATIF:"AB-", O_POSITIF:"O+", O_NEGATIF:"O-" }
const TYPES_ANTECEDENT = ["MEDICAL","CHIRURGICAL","FAMILIAL","ALLERGIE"]

export default function PatientPortalPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState("login")
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fichiers, setFichiers] = useState([])
  const [typeDoc, setTypeDoc] = useState("AUTRE")

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [reg, setReg] = useState({
    email:"", password:"", confirmPassword:"",
    nom:"", prenom:"", cin:"", dateNaissance:"", sexe:"MASCULIN",
    telephone:"", adresse:"", ville:"",
    groupeSanguin:"", mutuelle:"", numeroCNSS:"",
    antecedents: [],
  })

  const updateReg = (f, v) => setReg(p => ({ ...p, [f]: v }))

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      const res = await authApi.login(loginForm)
      const data = res.data
      if (data.role !== "PATIENT") { setError("Ce portail est reserve aux patients."); return }
      login(data, data.token)
      navigate("/patient/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects.")
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    setError(""); setLoading(true)
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
      const patientId = data?.patientId || data?.id
      if (fichiers.length > 0 && patientId) {
        for (const f of fichiers) {
          const fd = new FormData()
          fd.append("file", f)
          fd.append("type", typeDoc)
          fd.append("description", "Document inscription")
          try {
            await fetch(`http://localhost:8081/api/documents/upload/${patientId}`, { method: "POST", body: fd })
          } catch (e) { console.error("upload doc", e) }
        }
      }
      navigate("/patient/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l inscription.")
    } finally { setLoading(false) }
  }

  const validateStep = () => {
    setError("")
    if (step === 0) {
      if (!reg.email || !reg.password) return setError("Email et mot de passe obligatoires.")
      if (reg.password.length < 8) return setError("Minimum 8 caracteres.")
      if (reg.password !== reg.confirmPassword) return setError("Les mots de passe ne correspondent pas.")
    }
    if (step === 1) {
      if (!reg.nom || !reg.prenom || !reg.cin || !reg.dateNaissance) return setError("Nom, prenom, CIN et date de naissance obligatoires.")
    }
    return true
  }

  const nextStep = () => {
    if (step === STEPS.length - 1) { handleRegister(); return }
    if (!validateStep()) return
    setStep(s => s + 1)
  }
  const prevStep = () => setStep(s => s - 1)

  const addAntecedent = () => setReg(p => ({ ...p, antecedents: [...p.antecedents, { type: "MEDICAL", description: "", dateApparition: null }] }))
  const removeAntecedent = (i) => setReg(p => ({ ...p, antecedents: p.antecedents.filter((_, j) => j !== i) }))
  const updateAntecedent = (i, f, v) => setReg(p => { const a = [...p.antecedents]; a[i] = { ...a[i], [f]: v }; return { ...p, antecedents: a } })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-teal-700 flex">
      <div className="hidden lg:flex flex-1 flex-col justify-center items-start p-16 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="font-bold text-xl">MedSys</div>
            <div className="text-primary-200 text-sm">HOSPITAL MANAGEMENT</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Votre sante,<br />notre priorite</h1>
        <p className="text-primary-200 text-lg mb-8">Accedez a votre dossier medical, prenez rendez-vous et communiquez avec votre equipe soignante en toute simplicite.</p>
        <div className="flex gap-6 text-sm text-primary-200">
          <span>Dossier medical</span>
          <span>Rendez-vous</span>
          <span>Ordonnances</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex gap-2 mb-6 bg-slate-100 rounded-xl p-1">
            <button onClick={() => { setMode("login"); setError("") }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${mode === "login" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>
              <LogIn className="w-4 h-4" /> Connexion
            </button>
            <button onClick={() => { setMode("register"); setStep(0); setError("") }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${mode === "register" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>
              <UserPlus className="w-4 h-4" /> Inscription
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Connexion patient</h2>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={loginForm.email}
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
              </div>
              <div className="relative">
                <label className="label">Mot de passe</label>
                <input className="input pr-10" type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="********" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary btn-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Se connecter
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Creer un compte</h2>
              <p className="text-sm text-slate-500 mb-4">Etape {step + 1}/{STEPS.length} — {STEPS[step].label}</p>

              <div className="flex gap-1.5 mb-6">
                {STEPS.map((s, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? "bg-primary-600" : "bg-slate-200"}`} />
                ))}
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Email *</label>
                    <input className="input" type="email" value={reg.email} onChange={e => updateReg("email", e.target.value)} required />
                  </div>
                  <div className="relative">
                    <label className="label">Mot de passe *</label>
                    <input className="input pr-10" type={showPassword ? "text" : "password"}
                      value={reg.password} onChange={e => updateReg("password", e.target.value)}
                      placeholder="Minimum 8 caracteres" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div>
                    <label className="label">Confirmer le mot de passe *</label>
                    <input className="input" type="password" value={reg.confirmPassword}
                      onChange={e => updateReg("confirmPassword", e.target.value)} placeholder="********" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Nom *</label>
                      <input className="input" value={reg.nom} onChange={e => updateReg("nom", e.target.value)} required /></div>
                    <div><label className="label">Prenom *</label>
                      <input className="input" value={reg.prenom} onChange={e => updateReg("prenom", e.target.value)} required /></div>
                    <div><label className="label">CIN *</label>
                      <input className="input" value={reg.cin} onChange={e => updateReg("cin", e.target.value)} required /></div>
                    <div><label className="label">Date de naissance *</label>
                      <input className="input" type="date" value={reg.dateNaissance} onChange={e => updateReg("dateNaissance", e.target.value)} required /></div>
                    <div><label className="label">Sexe</label>
                      <select className="input" value={reg.sexe} onChange={e => updateReg("sexe", e.target.value)}>
                        <option value="MASCULIN">Masculin</option>
                        <option value="FEMININ">Feminin</option>
                      </select></div>
                    <div><label className="label">Telephone</label>
                      <input className="input" value={reg.telephone} onChange={e => updateReg("telephone", e.target.value)} placeholder="06..." /></div>
                  </div>
                  <div><label className="label">Adresse</label>
                    <input className="input" value={reg.adresse} onChange={e => updateReg("adresse", e.target.value)} /></div>
                  <div><label className="label">Ville</label>
                    <input className="input" value={reg.ville} onChange={e => updateReg("ville", e.target.value)} /></div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Groupe sanguin</label>
                    <div className="grid grid-cols-4 gap-2">
                      {GROUPES_SANGUINS.map(gs => (
                        <button key={gs} type="button"
                          onClick={() => updateReg("groupeSanguin", reg.groupeSanguin === gs ? "" : gs)}
                          className={`py-2 rounded-lg text-sm font-bold border transition-all ${reg.groupeSanguin === gs ? "bg-red-50 border-red-400 text-red-700" : "bg-white border-slate-200 text-slate-600 hover:border-red-300"}`}>
                          {LABEL_GS[gs]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="label">Mutuelle</label>
                    <input className="input" value={reg.mutuelle} onChange={e => updateReg("mutuelle", e.target.value)} placeholder="ex: CNOPS, CNSS, AMO..." /></div>
                  <div><label className="label">N CNSS</label>
                    <input className="input" value={reg.numeroCNSS} onChange={e => updateReg("numeroCNSS", e.target.value)} placeholder="Optionnel" /></div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Ajoutez vos antecedents medicaux si vous en avez. Cette etape est optionnelle.</p>
                  {reg.antecedents.map((ant, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2 relative bg-slate-50">
                      <button type="button" onClick={() => removeAntecedent(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-slate-500">Type</label>
                          <select value={ant.type} onChange={e => updateAntecedent(i, "type", e.target.value)} className="input">
                            {TYPES_ANTECEDENT.map(t => <option key={t} value={t}>{t}</option>)}
                          </select></div>
                        <div><label className="text-xs text-slate-500">Date</label>
                          <input type="date" value={ant.dateApparition || ""} onChange={e => updateAntecedent(i, "dateApparition", e.target.value || null)} className="input" /></div>
                      </div>
                      <div><label className="text-xs text-slate-500">Description</label>
                        <input value={ant.description} onChange={e => updateAntecedent(i, "description", e.target.value)}
                          className="input" placeholder="ex: Allergie a la penicilline" /></div>
                    </div>
                  ))}
                  <button type="button" onClick={addAntecedent}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Ajouter un antecedent
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Uploadez vos documents medicaux (CIN, mutuelle, ordonnances...). Etape optionnelle.</p>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 mb-3">Cliquez pour selectionner vos fichiers</p>
                    <input type="file" multiple accept=".pdf,image/*"
                      onChange={e => setFichiers(Array.from(e.target.files))}
                      className="hidden" id="docUpload" />
                    <label htmlFor="docUpload" className="btn-primary cursor-pointer text-sm px-4 py-2 rounded-lg">
                      Choisir des fichiers
                    </label>
                  </div>
                  {fichiers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">{fichiers.length} fichier(s) selectionne(s)</p>
                      {fichiers.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-slate-700 truncate">{f.name}</span>
                          <button type="button" onClick={() => setFichiers(fichiers.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <div>
                        <label className="label">Type de document</label>
                        <select value={typeDoc} onChange={e => setTypeDoc(e.target.value)} className="input">
                          <option value="AUTRE">Autre</option>
                          <option value="ORDONNANCE">Ordonnance</option>
                          <option value="ANALYSE">Analyse</option>
                          <option value="RADIO">Radio</option>
                          <option value="COMPTE_RENDU">Compte-rendu</option>
                          <option value="CIN">Carte CIN</option>
                          <option value="MUTUELLE">Mutuelle</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button type="button" onClick={prevStep}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                )}
                <button type="button" onClick={nextStep} disabled={loading}
                  className="flex-1 btn-primary btn-lg flex items-center justify-center gap-1.5">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creation...</>
                    : step === STEPS.length - 1 ? <><Check className="w-4 h-4" /> Creer mon compte</>
                    : <>Continuer <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login/personnel" className="text-sm text-slate-500 hover:text-primary-600 font-medium">
              Acces personnel medical
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
"""

with open(r"C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\pages\PatientPortalPage.jsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)
print("DONE - PatientPortalPage.jsx reecrit proprement!")
