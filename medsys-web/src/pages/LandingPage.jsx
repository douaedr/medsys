import { useNavigate } from 'react-router-dom'
import {
  Activity, Shield, Users, Calendar, Stethoscope,
  ArrowRight, CheckCircle2, Hospital, FileText, MessageSquare,
  Heart, Truck, ClipboardList
} from 'lucide-react'

const FEATURES = [
  { icon: Shield, title: 'Securite maximale', desc: 'Authentification JWT et chiffrement des donnees medicales', color: 'bg-blue-50 text-blue-600' },
  { icon: Users, title: 'Gestion multi-roles', desc: 'Patients, medecins, infirmiers, brancardiers et directeurs', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Calendar, title: 'Rendez-vous intelligents', desc: 'Planification en temps reel avec rappels automatiques', color: 'bg-blue-50 text-blue-600' },
  { icon: FileText, title: 'Dossier medical numerique', desc: 'Historique complet, ordonnances et analyses accessibles', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Heart, title: 'Soins coordonnes', desc: 'Taches assignees entre medecins, infirmiers et aides soignants', color: 'bg-blue-50 text-blue-600' },
  { icon: Truck, title: 'Module transport', desc: 'Fiches transport creees par infirmiers, validees par brancardiers', color: 'bg-emerald-50 text-emerald-600' },
]

const STATS = [
  { value: '10+', label: 'Roles utilisateurs' },
  { value: '6', label: 'Microservices' },
  { value: '100%', label: 'Securise' },
  { value: '24/7', label: 'Disponibilite' },
]

const ROLES = [
  { icon: Stethoscope, label: 'Medecin', color: 'bg-blue-100 text-blue-700' },
  { icon: Heart, label: 'Infirmier(e)', color: 'bg-emerald-100 text-emerald-700' },
  { icon: Truck, label: 'Brancardier', color: 'bg-orange-100 text-orange-700' },
  { icon: ClipboardList, label: 'Aide Soignant', color: 'bg-purple-100 text-purple-700' },
  { icon: Users, label: 'Secretaire', color: 'bg-pink-100 text-pink-700' },
  { icon: Activity, label: 'Chef de Service', color: 'bg-indigo-100 text-indigo-700' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg tracking-tight">MedSys</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Hospital Management</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login/personnel')} className="btn-ghost text-slate-600">
              Espace personnel
            </button>
            <button onClick={() => navigate('/patient')} className="btn-primary">
              Espace patient <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                  Systeme hospitalier nouvelle generation
                </span>
              </div>
              <h1 className="text-5xl font-bold tracking-tight leading-tight mb-5">
                La gestion hospitaliere,<br />
                <span className="text-emerald-400">reinventee.</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Une plateforme integree pour gerer patients, rendez-vous, dossiers medicaux
                et tout le personnel soignant, avec une architecture moderne et securisee.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/patient')} className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-all flex items-center gap-2 shadow-lg">
                  Espace patient <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/login/personnel')} className="bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
                  Acces personnel soignant
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 space-y-3">
                  <Hospital className="w-8 h-8 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">Hopital connecte</div>
                    <div className="text-sm text-white/60 mt-1">Tous les services synchronises</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 space-y-3 mt-8">
                  <Stethoscope className="w-8 h-8 text-blue-300" />
                  <div>
                    <div className="font-bold text-white">Soins coordonnes</div>
                    <div className="text-sm text-white/60 mt-1">Communication fluide</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 space-y-3">
                  <Shield className="w-8 h-8 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">100% securise</div>
                    <div className="text-sm text-white/60 mt-1">Conformite RGPD</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 space-y-3 mt-8">
                  <CheckCircle2 className="w-8 h-8 text-blue-300" />
                  <div>
                    <div className="font-bold text-white">Temps reel</div>
                    <div className="text-sm text-white/60 mt-1">Donnees toujours a jour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
            Concu pour tous les acteurs de l'hopital
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {ROLES.map(r => (
              <div key={r.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${r.color}`}>
                <r.icon className="w-4 h-4" />
                {r.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Tout ce dont votre etablissement a besoin
            </h2>
            <p className="text-slate-600 text-lg">
              Une suite complete d'outils pour moderniser la gestion hospitaliere
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover p-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pret a moderniser votre hopital ?</h2>
          <p className="text-white/70 mb-8">Connectez-vous en tant que patient ou personnel soignant</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/patient')} className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-all flex items-center gap-2">
              Espace patient <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/login/personnel')} className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all">
              Personnel soignant
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            <span className="font-semibold text-slate-600">MedSys</span>
          </div>
          <span>2026 — Projet de fin d'annee — Architecture microservices</span>
        </div>
      </footer>
    </div>
  )
}
