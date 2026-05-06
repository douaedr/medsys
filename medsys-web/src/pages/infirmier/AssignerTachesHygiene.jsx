import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8081/api";
const CATEGORIES = ["Hygiene", "Repas", "Mobilisation", "Confort", "Autre"];

export default function AssignerTachesHygiene() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [aidesSoignants, setAidesSoignants] = useState([]);
  const [taches, setTaches] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", categorie: "Hygiene", aideSoignantId: "", patientId: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get(`${API}/personnel/role/AIDE_SOIGNANT`, { headers }).then(r => setAidesSoignants(r.data)).catch(() => {});
    charger();
  }, []);

  const charger = () => {
    axios.get(`${API}/taches-hygiene/infirmier/${user.id}`, { headers }).then(r => setTaches(r.data)).catch(() => {});
  };

  const handleSubmit = async () => {
    if (!form.titre || !form.aideSoignantId) { setMsg("Titre et aide soignant obligatoires."); return; }
    try {
      await axios.post(`${API}/taches-hygiene`, {
        ...form,
        infirmierId: user.id,
        aideSoignantId: Number(form.aideSoignantId),
        patientId: Number(form.patientId) || 0,
      }, { headers });
      setMsg("Tache assignee !");
      setForm({ titre: "", description: "", categorie: "Hygiene", aideSoignantId: "", patientId: "" });
      charger();
    } catch { setMsg("Erreur."); }
  };

  const couleurStatut = s => s === "VALIDEE" ? "#22c55e" : s === "EN_COURS" ? "#3b82f6" : "#94a3b8";

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1e293b" }}>🧹 Assigner taches hygiene</h2>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Nouvelle tache</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <input placeholder="Titre *" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} style={inp} />
          <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={inp}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.aideSoignantId} onChange={e => setForm({ ...form, aideSoignantId: e.target.value })} style={inp}>
            <option value="">-- Aide Soignant *</option>
            {aidesSoignants.map(a => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
          </select>
          <input placeholder="ID Patient (optionnel)" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} style={inp} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inp, gridColumn: "1 / -1", height: "70px" }} />
        </div>
        {msg && <p style={{ marginTop: "10px", color: msg.includes("!") ? "#16a34a" : "#dc2626", fontSize: "14px" }}>{msg}</p>}
        <button onClick={handleSubmit} style={{ marginTop: "16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Assigner</button>
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Taches assignees</h3>
      {taches.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>Aucune tache.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {taches.map(t => (
            <div key={t.id} style={{ background: "#fff", borderRadius: "10px", padding: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, color: "#1e293b", margin: 0 }}>{t.titre}</p>
                <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0" }}>{t.categorie}</p>
              </div>
              <span style={{ background: couleurStatut(t.statut), color: "#fff", borderRadius: "20px", padding: "2px 12px", fontSize: "12px" }}>{t.statut}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const inp = { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", width: "100%", boxSizing: "border-box" };
