import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8081/api";

const CATEGORIES = ["Hygiene", "Repas", "Mobilisation", "Confort", "Autre"];

export default function MesTachesHygiene() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [taches, setTaches] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  const charger = () => {
    axios.get(`${API}/taches-hygiene/aide-soignant/${user.id}`, { headers })
      .then(r => {
        setTaches(r.data);
        setNotifCount(r.data.filter(t => t.statut === "EN_ATTENTE").length);
      }).catch(() => {});
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 30000);
    return () => clearInterval(interval);
  }, []);

  const demarrer = async (id) => {
    await axios.put(`${API}/taches-hygiene/${id}/demarrer`, {}, { headers });
    charger();
  };

  const valider = async (id) => {
    await axios.put(`${API}/taches-hygiene/${id}/valider`, {}, { headers });
    charger();
  };

  const couleurCategorie = c => {
    const map = { Hygiene: "#3b82f6", Repas: "#f59e0b", Mobilisation: "#8b5cf6", Confort: "#22c55e", Autre: "#94a3b8" };
    return map[c] || "#94a3b8";
  };

  const tachesParStatut = (statut) => taches.filter(t => t.statut === statut);

  const Section = ({ titre, items }) => (
    <div style={{ marginBottom: "28px" }}>
      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#475569", marginBottom: "12px" }}>
        {titre} <span style={{ background: "#e2e8f0", borderRadius: "20px", padding: "2px 10px", fontSize: "12px" }}>{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p style={{ color: "#cbd5e1", fontSize: "13px", padding: "16px", textAlign: "center" }}>Aucune tache</p>
      ) : items.map(t => (
        <div key={t.id} style={{ background: "#fff", borderRadius: "10px", padding: "16px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${couleurCategorie(t.categorie)}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 600, color: "#1e293b", margin: 0 }}>{t.titre}</p>
              <span style={{ background: couleurCategorie(t.categorie), color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", marginTop: "4px", display: "inline-block" }}>{t.categorie}</span>
              {t.description && <p style={{ color: "#64748b", fontSize: "13px", margin: "6px 0 0" }}>{t.description}</p>}
              <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                Assigne le {new Date(t.dateAssignation).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div style={{ flexShrink: 0, marginLeft: "12px" }}>
              {t.statut === "EN_ATTENTE" && (
                <button onClick={() => demarrer(t.id)} style={{ ...btn, background: "#3b82f6" }}>▶ Demarrer</button>
              )}
              {t.statut === "EN_COURS" && (
                <button onClick={() => valider(t.id)} style={{ ...btn, background: "#22c55e" }}>✓ Valider</button>
              )}
              {t.statut === "VALIDEE" && (
                <span style={{ color: "#22c55e", fontSize: "13px", fontWeight: 600 }}>✓ Termine</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: 0 }}>🧹 Mes taches</h2>
        {notifCount > 0 && (
          <span style={{ background: "#ef4444", color: "#fff", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: 600 }}>
            🔔 {notifCount} nouvelle{notifCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <Section titre="⏳ En attente" items={tachesParStatut("EN_ATTENTE")} />
      <Section titre="🔄 En cours" items={tachesParStatut("EN_COURS")} />
      <Section titre="✅ Validees" items={tachesParStatut("VALIDEE")} />
    </div>
  );
}

const btn = { color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
