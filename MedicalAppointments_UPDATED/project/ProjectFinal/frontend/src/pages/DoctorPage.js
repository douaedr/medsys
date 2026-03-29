import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { getAllAppointments, createSlot, blockSlot, cancelAppointment, getServices, getMyDoctorServices, assignDoctorServices } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("calendar");
  const [newSlot, setNewSlot] = useState({ startTime:"", endTime:"" });
  const [slotMsg, setSlotMsg] = useState("");
  const [slotError, setSlotError] = useState("");
  const [allServices, setAllServices] = useState([]);
  const [myServiceIds, setMyServiceIds] = useState([]);
  const [serviceMsg, setServiceMsg] = useState("");

  useEffect(() => {
  useEffect(() => {
    if (tab === "services") {
      Promise.all([getServices(), getMyDoctorServices()])
        .then(([allRes, myRes]) => {
          setAllServices(allRes.data);
          setMyServiceIds(myRes.data.map(s => s.id));
        }).catch(() => {});
    }
  }, [tab]);

  const handleToggleService = (id) => {
    setMyServiceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveServices = async () => {
    setServiceMsg("");
    try {
      await assignDoctorServices({ doctorId: user.id, serviceIds: myServiceIds });
      setServiceMsg("✅ Services mis à jour !");
    } catch { setServiceMsg("❌ Erreur lors de la mise à jour."); }
  };

    if (tab === "appointments") {
      getAllAppointments().then(res => setAppointments(res.data)).catch(() => {});
    }
  }, [tab]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSlotMsg(""); setSlotError("");
    try {
      await createSlot(newSlot);
      setSlotMsg("✅ Créneau créé avec succès !");
      setNewSlot({ startTime:"", endTime:"" });
    } catch (err) {
      setSlotError(err.response?.data?.message || "Erreur");
    }
  };

  const handleCancelAppt = async (id) => {
    if (!window.confirm("Confirmer l'annulation ?")) return;
    try {
      await cancelAppointment({ appointmentId: id });
      setAppointments(prev => prev.map(a => a.id === id ? {...a, status:"CancelledByDoctor"} : a));
    } catch (err) { alert(err.response?.data?.message || "Erreur"); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <span style={styles.logo}>🏥 Espace Médecin</span>
        <div style={styles.actions}>
          <span style={styles.name}>👨‍⚕️ {user?.fullName}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>Déconnexion</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          {[["calendar","📅 Calendrier"],["create","➕ Créer créneau"],["appointments","📋 Rendez-vous"],["services","🏷️ Mes services"]].map(([key,label]) => (
            <button key={key} style={{...styles.tab, ...(tab===key?styles.tabActive:{})}} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Calendrier */}
        {tab === "calendar" && (
          <div>
            <h2 style={styles.title}>Calendrier des créneaux</h2>
            <Calendar doctorId={1} role="Doctor" />
          </div>
        )}

        {/* Créer créneau */}
        {tab === "create" && (
          <div style={styles.formCard}>
            <h2 style={styles.title}>Créer un nouveau créneau</h2>
            {slotMsg && <div style={styles.success}>{slotMsg}</div>}
            {slotError && <div style={styles.error}>{slotError}</div>}
            <form onSubmit={handleCreateSlot}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Date et heure de début</label>
                  <input style={styles.input} type="datetime-local" required
                    value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime:e.target.value})} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date et heure de fin</label>
                  <input style={styles.input} type="datetime-local" required
                    value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime:e.target.value})} />
                </div>
              </div>
              <button style={styles.createBtn} type="submit">Créer le créneau</button>
            </form>
          </div>
        )}

        {/* Liste des RDV */}
        {tab === "appointments" && (
          <div>
            <h2 style={styles.title}>Tous les rendez-vous</h2>
            {appointments.length === 0 && <p style={styles.empty}>Aucun rendez-vous trouvé.</p>}
            <div style={styles.table}>
              {appointments.map(appt => (
                <div key={appt.id} style={styles.apptRow}>
                  <div>
                    <strong>{appt.patientName}</strong>
                    <span style={styles.email}> — {appt.patientEmail}</span>
                  </div>
                  <div style={styles.apptDate}>
                    {new Date(appt.startTime).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}
                    {" "}
                    {new Date(appt.startTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                  </div>
                  <span style={{...styles.badge, ...getBadgeStyle(appt.status)}}>{appt.status}</span>
                  {appt.status === "Confirmed" && (
                    <button style={styles.cancelBtn} onClick={() => handleCancelAppt(appt.id)}>Annuler</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Mes services */}
        {tab === "services" && (
          <div>
            <h3 style={styles.title}>🏷️ Mes services médicaux</h3>
            <p style={{color:"#666",marginBottom:"20px"}}>Cochez les services que vous proposez. Les patients pourront vous trouver via ces spécialités.</p>
            {serviceMsg && <div style={serviceMsg.startsWith("✅") ? styles.success : styles.error}>{serviceMsg}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {allServices.map(svc => (
                <label key={svc.id} style={{
                  background:"white", borderRadius:"12px", padding:"16px", display:"flex", alignItems:"center", gap:"12px",
                  cursor:"pointer", border: myServiceIds.includes(svc.id) ? "2px solid #2563eb" : "2px solid #e5e7eb",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
                }}>
                  <input type="checkbox" checked={myServiceIds.includes(svc.id)} onChange={() => handleToggleService(svc.id)}
                    style={{width:"18px",height:"18px",cursor:"pointer"}} />
                  <span style={{fontSize:"24px"}}>{svc.icon || "🏥"}</span>
                  <div>
                    <div style={{fontWeight:"700",color:"#1e3a5f",fontSize:"14px"}}>{svc.name}</div>
                    {svc.description && <div style={{fontSize:"11px",color:"#888",marginTop:"2px"}}>{svc.description}</div>}
                  </div>
                </label>
              ))}
            </div>
            <button style={styles.createBtn} onClick={handleSaveServices}>💾 Enregistrer mes services</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getBadgeStyle(status) {
  if (status === "Confirmed") return { background:"#dcfce7", color:"#16a34a" };
  if (status.includes("Cancelled")) return { background:"#fee2e2", color:"#dc2626" };
  return { background:"#f3f4f6", color:"#666" };
}

const styles = {
  page: { minHeight:"100vh", background:"#f0f4f8" },
  topbar: { background:"white", padding:"12px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  logo: { fontSize:"20px", fontWeight:"700", color:"#1e3a5f" },
  actions: { display:"flex", gap:"12px", alignItems:"center" },
  name: { color:"#555" },
  logoutBtn: { padding:"8px 16px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  content: { maxWidth:"1100px", margin:"0 auto", padding:"32px 16px" },
  tabs: { display:"flex", gap:"8px", marginBottom:"24px", flexWrap:"wrap" },
  tab: { padding:"10px 24px", background:"white", border:"2px solid #ddd", borderRadius:"10px", cursor:"pointer", fontWeight:"600", fontSize:"15px" },
  tabActive: { background:"#2563eb", color:"white", borderColor:"#2563eb" },
  title: { color:"#1e3a5f", fontSize:"22px", marginBottom:"20px" },
  formCard: { background:"white", borderRadius:"16px", padding:"28px", maxWidth:"600px", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" },
  row: { display:"flex", gap:"16px", flexWrap:"wrap" },
  field: { flex:1, minWidth:"200px" },
  label: { display:"block", marginBottom:"6px", fontSize:"14px", fontWeight:"600", color:"#555" },
  input: { width:"100%", padding:"11px", border:"1px solid #ddd", borderRadius:"8px", fontSize:"14px", boxSizing:"border-box" },
  createBtn: { padding:"12px 28px", background:"#16a34a", color:"white", border:"none", borderRadius:"10px", cursor:"pointer", fontWeight:"600", fontSize:"15px", marginTop:"16px" },
  success: { background:"#dcfce7", color:"#16a34a", padding:"12px", borderRadius:"8px", marginBottom:"16px" },
  error: { background:"#fee2e2", color:"#dc2626", padding:"12px", borderRadius:"8px", marginBottom:"16px" },
  empty: { color:"#888", textAlign:"center", padding:"40px" },
  table: { display:"grid", gap:"10px" },
  apptRow: { background:"white", borderRadius:"10px", padding:"16px 20px", display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  email: { color:"#888", fontSize:"13px" },
  apptDate: { color:"#2563eb", fontWeight:"600", fontSize:"14px", marginLeft:"auto" },
  badge: { padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600" },
  cancelBtn: { padding:"6px 14px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"13px" },
};
