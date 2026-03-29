import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import {
  bookAppointment,
  joinWaitingList,
  getServices,
  getDoctorsByService,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BookPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ patientName:"", patientEmail:"", patientPhone:"", reason:"" });
  const [waitingForm, setWaitingForm] = useState({ patientName:"", email:"", phone:"", weekStart:"" });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

  useEffect(() => {
    getServices()
      .then(res => setServices(res.data))
      .catch(() => {})
      .finally(() => setLoadingSvc(false));
  }, []);

  const handleSelectService = async (svc) => {
    setSelectedService(svc);
    setSelectedDoctor(null);
    setStep(2);
    setLoadingDoc(true);
    try {
      const res = await getDoctorsByService(svc.id);
      setDoctors(res.data);
    } catch {
      setDoctors([]);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setStep(3);
  };

  const goBack = () => {
    if (step === 2) { setStep(1); setSelectedService(null); }
    if (step === 3) { setStep(2); setSelectedDoctor(null); setSelectedSlot(null); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { timeSlotId: selectedSlot.id, reason: form.reason };
      if (!isLoggedIn) {
        payload.patientName  = form.patientName;
        payload.patientEmail = form.patientEmail;
        payload.patientPhone = form.patientPhone;
      }
      const res = await bookAppointment(payload);
      setSuccess(res.data);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleWaiting = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await joinWaitingList({ doctorId: selectedDoctor.id, ...waitingForm });
      alert("Inscription sur la liste d'attente confirmée !");
      setShowWaiting(false);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <span style={s.logo}>🏥 Rendez-vous Médicaux</span>
        <div style={s.actions}>
          {isLoggedIn ? (
            <>
              <span style={s.welcome}>Bonjour, {user?.fullName}</span>
              <button style={s.linkBtn} onClick={() => navigate("/patient")}>Mes RDV</button>
            </>
          ) : (
            <>
              <button style={s.linkBtn} onClick={() => navigate("/login")}>Connexion</button>
              <button style={s.linkBtnFilled} onClick={() => navigate("/register")}>Inscription</button>
            </>
          )}
        </div>
      </div>

      <div style={s.content}>

        {/* Stepper */}
        <div style={s.stepper}>
          {[{n:1,label:"Service"},{n:2,label:"Médecin"},{n:3,label:"Créneau"}].map(({n,label}) => (
            <React.Fragment key={n}>
              <div style={s.stepItem}>
                <div style={{...s.stepCircle, background: step>=n?"#2563eb":"#e5e7eb", color: step>=n?"white":"#9ca3af"}}>
                  {step>n?"✓":n}
                </div>
                <span style={{...s.stepLabel, color: step>=n?"#2563eb":"#9ca3af"}}>{label}</span>
              </div>
              {n<3 && <div style={{...s.stepLine, background: step>n?"#2563eb":"#e5e7eb"}} />}
            </React.Fragment>
          ))}
        </div>

        {/* ÉTAPE 1 — Services */}
        {step === 1 && (
          <div>
            <h2 style={s.stepTitle}>Choisissez un service médical</h2>
            <p style={s.stepSub}>Sélectionnez la spécialité dont vous avez besoin</p>
            {loadingSvc ? <p style={s.loading}>Chargement...</p> : (
              <div style={s.serviceGrid}>
                {services.map(svc => (
                  <button key={svc.id} style={s.serviceCard} onClick={() => handleSelectService(svc)}>
                    <span style={s.serviceIcon}>{svc.icon || "🏥"}</span>
                    <span style={s.serviceName}>{svc.name}</span>
                    {svc.description && <span style={s.serviceDesc}>{svc.description}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 2 — Médecins */}
        {step === 2 && (
          <div>
            <button style={s.backBtn} onClick={goBack}>← Retour</button>
            <h2 style={s.stepTitle}>{selectedService?.icon} {selectedService?.name} — Choisissez un médecin</h2>
            <p style={s.stepSub}>Sélectionnez le médecin avec qui vous souhaitez consulter</p>
            {loadingDoc ? <p style={s.loading}>Chargement...</p> : doctors.length === 0 ? (
              <div style={s.emptyDoc}>
                <p style={{fontSize:"48px"}}>🔍</p>
                <p>Aucun médecin disponible pour ce service.</p>
                <button style={s.backBtn2} onClick={goBack}>Choisir un autre service</button>
              </div>
            ) : (
              <div style={s.doctorGrid}>
                {doctors.map(doc => (
                  <button key={doc.id} style={s.doctorCard} onClick={() => handleSelectDoctor(doc)}>
                    <div style={s.doctorAvatar}>{doc.fullName.charAt(0).toUpperCase()}</div>
                    <div style={s.doctorInfo}>
                      <span style={s.doctorName}>{doc.fullName}</span>
                      <span style={s.doctorService}>{selectedService?.name}</span>
                      {doc.email && <span style={s.doctorEmail}>✉️ {doc.email}</span>}
                    </div>
                    <span style={s.doctorArrow}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 3 — Calendrier */}
        {step === 3 && (
          <div>
            <button style={s.backBtn} onClick={goBack}>← Retour</button>
            <div style={s.selectionSummary}>
              <div style={s.summaryItem}>
                <span style={{fontSize:"28px"}}>{selectedService?.icon || "🏥"}</span>
                <div>
                  <div style={s.summaryLabel}>Service</div>
                  <div style={s.summaryValue}>{selectedService?.name}</div>
                </div>
              </div>
              <div style={s.summaryDivider} />
              <div style={s.summaryItem}>
                <span style={{fontSize:"28px"}}>👨‍⚕️</span>
                <div>
                  <div style={s.summaryLabel}>Médecin</div>
                  <div style={s.summaryValue}>{selectedDoctor?.fullName}</div>
                </div>
              </div>
            </div>
            <h2 style={s.stepTitle}>📅 Créneaux disponibles</h2>
            <p style={s.stepSub}>Cliquez sur un créneau <span style={{color:"#16a34a",fontWeight:"bold"}}>vert</span> pour le réserver</p>
            <Calendar doctorId={selectedDoctor?.id} onSlotSelect={setSelectedSlot} role={user?.role} />
            <button style={s.waitingBtn} onClick={() => setShowWaiting(true)}>
              📋 S'inscrire sur la liste d'attente
            </button>
          </div>
        )}

        {/* Modal réservation */}
        {selectedSlot && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <h3 style={s.modalTitle}>Confirmer le rendez-vous</h3>
              <div style={s.recapBox}>
                <div style={s.recapRow}>{selectedService?.icon} {selectedService?.name}</div>
                <div style={s.recapRow}>👨‍⚕️ {selectedDoctor?.fullName}</div>
                <div style={s.recapRow}>
                  📅 {new Date(selectedSlot.startTime).toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}
                </div>
                <div style={s.recapRow}>
                  🕐 {new Date(selectedSlot.startTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                  {" – "}
                  {new Date(selectedSlot.endTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                </div>
              </div>
              {error && <div style={s.error}>{error}</div>}
              <form onSubmit={handleBook}>
                {!isLoggedIn && (
                  <>
                    <input style={s.input} placeholder="Votre nom complet *" required
                      value={form.patientName} onChange={e => setForm({...form,patientName:e.target.value})} />
                    <input style={s.input} type="email" placeholder="Votre email *" required
                      value={form.patientEmail} onChange={e => setForm({...form,patientEmail:e.target.value})} />
                    <input style={s.input} placeholder="Votre téléphone"
                      value={form.patientPhone} onChange={e => setForm({...form,patientPhone:e.target.value})} />
                  </>
                )}
                <textarea style={s.textarea} placeholder="Motif de la consultation (optionnel)"
                  value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} rows={3} />
                <div style={s.modalBtns}>
                  <button type="button" style={s.cancelBtn} onClick={() => setSelectedSlot(null)}>Annuler</button>
                  <button type="submit" style={s.confirmBtn} disabled={loading}>
                    {loading ? "Réservation..." : "✅ Confirmer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal succès */}
        {success && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={{textAlign:"center",fontSize:"56px",marginBottom:"8px"}}>✅</div>
              <h3 style={{...s.modalTitle,color:"#16a34a"}}>Rendez-vous confirmé !</h3>
              <div style={s.recapBox}>
                <div style={s.recapRow}>{selectedService?.icon} {selectedService?.name}</div>
                <div style={s.recapRow}>👨‍⚕️ {selectedDoctor?.fullName}</div>
                <div style={s.recapRow}>📅 {new Date(success.startTime).toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long"})}</div>
                <div style={s.recapRow}>🕐 {new Date(success.startTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
              {success.anonymousToken && (
                <div style={s.tokenBox}>
                  <p><strong>⚠️ Code d'annulation (conservez-le !) :</strong></p>
                  <code style={s.token}>{success.anonymousToken}</code>
                </div>
              )}
              <button style={{...s.confirmBtn,width:"100%"}} onClick={() => {setSuccess(null);setStep(1);setSelectedService(null);setSelectedDoctor(null);}}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal liste d'attente */}
        {showWaiting && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <h3 style={s.modalTitle}>📋 Liste d'attente</h3>
              <p style={{color:"#555",fontSize:"14px",marginBottom:"12px"}}>
                Médecin : <strong>{selectedDoctor?.fullName}</strong>. Vous serez notifié(e) par email dès qu'un créneau se libère.
              </p>
              <form onSubmit={handleWaiting}>
                <input style={s.input} placeholder="Votre nom *" required
                  value={waitingForm.patientName} onChange={e => setWaitingForm({...waitingForm,patientName:e.target.value})} />
                <input style={s.input} type="email" placeholder="Votre email *" required
                  value={waitingForm.email} onChange={e => setWaitingForm({...waitingForm,email:e.target.value})} />
                <input style={s.input} placeholder="Téléphone"
                  value={waitingForm.phone} onChange={e => setWaitingForm({...waitingForm,phone:e.target.value})} />
                <input style={s.input} type="date" required
                  value={waitingForm.weekStart} onChange={e => setWaitingForm({...waitingForm,weekStart:e.target.value})} />
                <p style={{fontSize:"12px",color:"#888",marginTop:"-6px",marginBottom:"10px"}}>Sélectionnez le lundi de la semaine souhaitée</p>
                <div style={s.modalBtns}>
                  <button type="button" style={s.cancelBtn} onClick={() => setShowWaiting(false)}>Annuler</button>
                  <button type="submit" style={s.confirmBtn} disabled={loading}>S'inscrire</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page:{ minHeight:"100vh", background:"#f0f4f8" },
  topbar:{ background:"white", padding:"12px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", flexWrap:"wrap", gap:"8px" },
  logo:{ fontSize:"20px", fontWeight:"700", color:"#1e3a5f" },
  actions:{ display:"flex", gap:"12px", alignItems:"center" },
  welcome:{ color:"#2563eb", fontWeight:"600" },
  linkBtn:{ padding:"8px 16px", background:"transparent", border:"2px solid #2563eb", color:"#2563eb", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  linkBtnFilled:{ padding:"8px 16px", background:"#2563eb", border:"none", color:"white", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  content:{ maxWidth:"1100px", margin:"0 auto", padding:"32px 16px" },
  stepper:{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"40px" },
  stepItem:{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" },
  stepCircle:{ width:"40px", height:"40px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", fontSize:"16px" },
  stepLabel:{ fontSize:"13px", fontWeight:"600" },
  stepLine:{ width:"80px", height:"3px", margin:"0 8px", marginBottom:"20px", borderRadius:"2px" },
  stepTitle:{ color:"#1e3a5f", fontSize:"24px", marginBottom:"8px" },
  stepSub:{ color:"#666", marginBottom:"24px", fontSize:"15px" },
  loading:{ textAlign:"center", color:"#888", padding:"40px", fontSize:"16px" },
  backBtn:{ padding:"8px 18px", background:"#f3f4f6", color:"#374151", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", marginBottom:"20px", fontSize:"14px" },
  backBtn2:{ padding:"10px 20px", background:"#2563eb", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", marginTop:"12px" },
  serviceGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"16px" },
  serviceCard:{ background:"white", border:"2px solid #e5e7eb", borderRadius:"16px", padding:"24px 16px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", textAlign:"center" },
  serviceIcon:{ fontSize:"40px" },
  serviceName:{ fontWeight:"700", color:"#1e3a5f", fontSize:"15px" },
  serviceDesc:{ fontSize:"12px", color:"#888", lineHeight:"1.5" },
  doctorGrid:{ display:"flex", flexDirection:"column", gap:"12px", maxWidth:"600px" },
  doctorCard:{ background:"white", border:"2px solid #e5e7eb", borderRadius:"14px", padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:"16px", textAlign:"left" },
  doctorAvatar:{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#1e40af)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", fontWeight:"700", flexShrink:0 },
  doctorInfo:{ display:"flex", flexDirection:"column", gap:"3px", flex:1 },
  doctorName:{ fontWeight:"700", color:"#1e3a5f", fontSize:"16px" },
  doctorService:{ color:"#2563eb", fontSize:"13px", fontWeight:"600" },
  doctorEmail:{ color:"#888", fontSize:"12px" },
  doctorArrow:{ color:"#2563eb", fontSize:"20px", fontWeight:"700" },
  emptyDoc:{ textAlign:"center", padding:"60px", color:"#888" },
  selectionSummary:{ background:"white", borderRadius:"14px", padding:"16px 24px", marginBottom:"24px", display:"flex", alignItems:"center", gap:"16px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", flexWrap:"wrap" },
  summaryItem:{ display:"flex", alignItems:"center", gap:"12px" },
  summaryLabel:{ fontSize:"11px", color:"#888", fontWeight:"600", textTransform:"uppercase" },
  summaryValue:{ fontSize:"15px", color:"#1e3a5f", fontWeight:"700" },
  summaryDivider:{ width:"1px", height:"36px", background:"#e5e7eb" },
  waitingBtn:{ marginTop:"20px", padding:"12px 24px", background:"#f59e0b", color:"white", border:"none", borderRadius:"10px", cursor:"pointer", fontWeight:"600", fontSize:"15px" },
  overlay:{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal:{ background:"white", padding:"32px", borderRadius:"16px", maxWidth:"480px", width:"90%", boxShadow:"0 8px 32px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" },
  modalTitle:{ color:"#1e3a5f", fontSize:"20px", marginBottom:"16px", textAlign:"center" },
  recapBox:{ background:"#f0f9ff", border:"1px solid #bfdbfe", borderRadius:"10px", padding:"14px 18px", marginBottom:"16px" },
  recapRow:{ color:"#1e40af", fontSize:"14px", padding:"4px 0", fontWeight:"500" },
  input:{ width:"100%", padding:"11px", border:"1px solid #ddd", borderRadius:"8px", marginBottom:"10px", fontSize:"14px", boxSizing:"border-box" },
  textarea:{ width:"100%", padding:"11px", border:"1px solid #ddd", borderRadius:"8px", marginBottom:"12px", fontSize:"14px", boxSizing:"border-box", resize:"vertical" },
  modalBtns:{ display:"flex", gap:"12px", justifyContent:"flex-end" },
  cancelBtn:{ padding:"10px 20px", background:"#f3f4f6", color:"#374151", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  confirmBtn:{ padding:"10px 24px", background:"#16a34a", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  error:{ background:"#fee2e2", color:"#dc2626", padding:"10px", borderRadius:"8px", marginBottom:"12px", fontSize:"13px" },
  tokenBox:{ background:"#fef3c7", border:"1px solid #fcd34d", padding:"16px", borderRadius:"10px", margin:"16px 0", textAlign:"center" },
  token:{ fontSize:"14px", fontWeight:"bold", wordBreak:"break-all", display:"block", marginTop:"8px", color:"#92400e" },
};
