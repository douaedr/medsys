import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAppointments, cancelAppointment } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS = {
  Confirmed: { label:"Confirmé", color:"#16a34a", bg:"#dcfce7" },
  CancelledByPatient: { label:"Annulé", color:"#dc2626", bg:"#fee2e2" },
  CancelledByDoctor: { label:"Annulé par médecin", color:"#dc2626", bg:"#fee2e2" },
  Completed: { label:"Terminé", color:"#2563eb", bg:"#dbeafe" },
  NoShow: { label:"Absent", color:"#d97706", bg:"#fef3c7" },
};

export default function PatientPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    getMyAppointments()
      .then(res => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    try {
      await cancelAppointment({ appointmentId: cancelId, cancelReason });
      setAppointments(prev => prev.map(a =>
        a.id === cancelId ? { ...a, status: "CancelledByPatient" } : a
      ));
      setCancelId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <span style={styles.logo}>🏥 Mon espace patient</span>
        <div style={styles.actions}>
          <span style={styles.name}>👤 {user?.fullName}</span>
          <button style={styles.bookBtn} onClick={() => navigate("/book")}>+ Nouveau RDV</button>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>Déconnexion</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Mes rendez-vous</h2>

        {loading && <p style={styles.loading}>Chargement...</p>}

        {!loading && appointments.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>📅</p>
            <p>Vous n'avez aucun rendez-vous.</p>
            <button style={styles.bookBtn} onClick={() => navigate("/book")}>Prendre un rendez-vous</button>
          </div>
        )}

        <div style={styles.grid}>
          {appointments.map(appt => {
            const st = STATUS_LABELS[appt.status] || { label:appt.status, color:"#666", bg:"#f3f4f6" };
            const canCancel = appt.status === "Confirmed";
            return (
              <div key={appt.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{...styles.badge, color:st.color, background:st.bg}}>{st.label}</span>
                  <span style={styles.cardDate}>
                    {new Date(appt.startTime).toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}
                  </span>
                </div>
                <div style={styles.cardTime}>
                  🕐 {new Date(appt.startTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                  {" – "}
                  {new Date(appt.endTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                </div>
                {canCancel && (
                  <button style={styles.cancelBtn} onClick={() => setCancelId(appt.id)}>
                    Annuler ce rendez-vous
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal annulation */}
      {cancelId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Annuler le rendez-vous</h3>
            <textarea style={styles.textarea} placeholder="Motif d'annulation (optionnel)"
              value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} />
            <div style={styles.modalBtns}>
              <button style={styles.keepBtn} onClick={() => setCancelId(null)}>Garder le RDV</button>
              <button style={styles.confirmCancelBtn} onClick={handleCancel}>Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"#f0f4f8" },
  topbar: { background:"white", padding:"12px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", flexWrap:"wrap", gap:"8px" },
  logo: { fontSize:"20px", fontWeight:"700", color:"#1e3a5f" },
  actions: { display:"flex", gap:"12px", alignItems:"center" },
  name: { color:"#555", fontSize:"15px" },
  bookBtn: { padding:"8px 18px", background:"#2563eb", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  logoutBtn: { padding:"8px 16px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  content: { maxWidth:"900px", margin:"0 auto", padding:"32px 16px" },
  title: { color:"#1e3a5f", fontSize:"26px", marginBottom:"24px" },
  loading: { textAlign:"center", color:"#888", padding:"40px" },
  empty: { textAlign:"center", padding:"60px", color:"#888" },
  emptyIcon: { fontSize:"48px", marginBottom:"12px" },
  grid: { display:"grid", gap:"16px" },
  card: { background:"white", borderRadius:"12px", padding:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px", flexWrap:"wrap", gap:"8px" },
  badge: { padding:"4px 12px", borderRadius:"20px", fontSize:"13px", fontWeight:"600" },
  cardDate: { color:"#555", fontSize:"15px" },
  cardTime: { color:"#2563eb", fontWeight:"600", fontSize:"15px", marginBottom:"12px" },
  cancelBtn: { padding:"8px 16px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"13px" },
  overlay: { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal: { background:"white", padding:"28px", borderRadius:"16px", maxWidth:"420px", width:"90%" },
  modalTitle: { color:"#dc2626", fontSize:"18px", marginBottom:"16px" },
  textarea: { width:"100%", padding:"10px", border:"1px solid #ddd", borderRadius:"8px", marginBottom:"16px", fontSize:"14px", boxSizing:"border-box" },
  modalBtns: { display:"flex", gap:"12px", justifyContent:"flex-end" },
  keepBtn: { padding:"10px 20px", background:"#f3f4f6", color:"#374151", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  confirmCancelBtn: { padding:"10px 20px", background:"#dc2626", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
};
