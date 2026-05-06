import { useNavigate } from "react-router-dom"
import {
  Activity, Shield, Users, Calendar, Stethoscope,
  ArrowRight, CheckCircle2, Hospital, FileText, MessageSquare
} from "lucide-react"

const FEATURES = [
  { icon: Shield, title: "Sécurité maximale", desc: "Authentification JWT et chiffrement des données médicales" },
  { icon: Users, title: "Gestion multi-rôles", desc: "Patients, médecins, administrateurs et directeurs" },
  { icon: Calendar, title: "Rendez-vous intelligents", desc: "Planification en temps réel avec rappels automatiques" },
  { icon: FileText, title: "Dossier médical numérique", desc: "Historique complet et accessible" },
  { icon: MessageSquare, title: "Messagerie intégrée", desc: "Communication directe patient-médecin" },
  { icon: Activity, title: "Architecture microservices", desc: "Performance et scalabilité garanties" },
]

const STATS = [
  { value: "6+", label: "Microservices" },
  { value: "9", label: "Rôles utilisateurs" },
  { value: "100%", label: "Sécurisé" },
  { value: "24/7", label: "Disponibilité" },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg tracking-tight">MedSys</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Hospital Management</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login/personnel")} className="btn-ghost">Personnel</button>
            <button onClick={() => navigate("/patient")} className="btn-primary">
              Espace patient <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-100 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                Système hospitalier nouvelle génération
              </span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
              La gestion hospitalière,<br />
              <span className="text-primary-600">réinventée.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Une plateforme intégrée pour gérer patients, rendez-vous, dossiers médicaux
              et personnel, avec une architecture moderne et sécurisée.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/patient")} className="btn-primary btn-lg">
                Commencer en tant que patient <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/login/personnel")} className="btn-outline btn-lg">
                Accès personnel soignant
              </button>
            </div>
            <div className="grid grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-100">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-transparent rounded-3xl blur-3xl opacity-60"></div>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="card p-6 space-y-3">
                <Hospital className="w-8 h-8 text-primary-600" />
                <div>
                  <div className="font-bold text-slate-900">Hôpital connecté</div>
                  <div className="text-sm text-slate-500 mt-1">Tous les services synchronisés</div>
                </div>
              </div>
              <div className="card p-6 space-y-3 mt-8">
                <Stethoscope className="w-8 h-8 text-primary-500" />
                <div>
                  <div className="font-bold text-slate-900">Soins coordonnés</div>
                  <div className="text-sm text-slate-500 mt-1">Communication fluide</div>
                </div>
              </div>
              <div className="card p-6 space-y-3">
                <Shield className="w-8 h-8 text-primary-600" />
                <div>
                  <div className="font-bold text-slate-900">100% sécurisé</div>
                  <div className="text-sm text-slate-500 mt-1">Conformité RGPD</div>
                </div>
              </div>
              <div className="card p-6 space-y-3 mt-8">
                <CheckCircle2 className="w-8 h-8 text-primary-600" />
                <div>
                  <div className="font-bold text-slate-900">Temps réel</div>
                  <div className="text-sm text-slate-500 mt-1">Données toujours à jour</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-primary-50 py-20 border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Tout ce dont votre établissement a besoin
            </h2>
            <p className="text-slate-600 text-lg">Une suite complète d-outils pour moderniser la gestion hospitalière</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover p-6">
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-700" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          © 2026 MedSys. Projet de fin d-année — Architecture microservices.
        </div>
      </footer>
    </div>
  )
}
