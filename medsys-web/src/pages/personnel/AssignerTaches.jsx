import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8081/api";

export default function AssignerTaches() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [infirmiers, setInfirmiers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [taches, setTaches] = useState([]);
  const [form, setForm] = useState({
    titre: "", description: "", priorite: "MOYENNE",
    infirmierId: "", patientId: ""
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get(`${API}/personnel/role/INFIRMIER`, { headers }).then(r => setInfirmiers(r.data)).catch(() => {});
    axios.get(`${API}/patients`, { headers }).then(r => setPatients(r.data)).catch(() => {});
    chargerTaches();
  }, []);

  const chargerTaches = () => {
    axios.get(`${API}/taches-soin/medecin/${user.id}`, { headers })
      .then(r => setTaches(r.data)).catch(() => {});
  };

  const handleSubmit = async () => {
    if (!form.titre || !form.infirmierId || !form.patientId) {
      setMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      await axios.post(`${API}/taches-soin`, {
        ...form,
        medecinId: user.id,
        infirmierId: Number(form.infirmierId),
        patientId: Number(form.patientId)
      }, { headers });
      setMsg("Tâche assignée avec succès !");
      setForm({ titre: "", description: "", priorite: "MOYENNE", infirmierId: "", patientId: "" });
      chargerTaches();
    } catch {
      setMsg("Erreur lors de l'assignation.");
    }
  };

  const couleurPriorite = p => p === "HAUTE" ? "#ef4444" : p === "MOYENNE" ? "#f59e0b" : "#22c55e";
  const couleurStatut = s => s === "VALIDEE" ? "#22c55e" : s === "EN_COURS" ? "#3b82f6" : "#94a3b8";

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1e293b" }}>
        📋 Assigner des tâches de soins
      </h2>

      {/* Formulaire */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#334155" }}>Nouvelle tâche</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <input placeholder="Titre *" value={form.titre}
            onChange={e => setForm({ ...form, titre: e.target.value })}
            style={inputStyle} />
          <select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })} style={inputStyle}>
            <option value="HAUTE">🔴 Haute</option>
            <option value="MOYENNE">🟡 Moyenne</option>
            <option value="BASSE">🟢 Basse</option>
          </select>
          <select value={form.infirmierId} onChange={e => setForm({ ...form, infirmierId: e.target.value })} style={inputStyle}>
            <option value="">-- Infirmier(e) *</option>
            {infirmiers.map(i => <option key={i.id} value={i.id}>{i.prenom} {i.nom}</option>)}
          </select>
          <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} style={inputStyle}>
            <option value="">-- Patient *</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
          </select>
          <textarea placeholder="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle, gridColumn: "1 / -1", height: "80px", resize: "vertical" }} />
        </div>
        {msg && <p style={{ marginTop: "10px", color: msg.includes("succès") ? "#16a34a" : "#dc2626", fontSize: "14px" }}>{msg}</p>}
        <button onClick={handleSubmit} style={btnStyle}>Assigner la tâche</button>
      </div>

      {/* Liste des tâches */}
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#334155" }}>Mes tâches assignées</h3>
      {taches.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>Aucune tâche assignée pour l'instant.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {taches.map(t => (
            <div key={t.id} style={{ background: "#fff", borderRadius: "10px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${couleurPriorite(t.priorite)}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{t.titre}</span>
                <span style={{ background: couleurStatut(t.statut), color: "#fff", borderRadius: "20px", padding: "2px 12px", fontSize: "12px" }}>{t.statut}</span>
              </div>
              {t.description && <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>{t.description}</p>}
              <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                Assigné le {new Date(t.dateAssignation).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", width: "100%", boxSizing: "border-box" };
const btnStyle = { marginTop: "16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" };