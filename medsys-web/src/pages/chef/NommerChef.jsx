import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8081";

function Alert({ type, message, onClose }) {
  if (!message) return null;
  const colors = {
    success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: "✓" },
    error: { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626", icon: "✕" }
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
      padding: "14px 18px", display: "flex", alignItems: "flex-start",
      gap: 12, marginBottom: 24
    }}>
      <span style={{ fontWeight: 700, color: c.text, fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
      <div style={{ flex: 1 }}>
        <span style={{ color: c.text, fontSize: 14 }}>{message}</span>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  );
}

function ChefCard({ chef, onRetirer, loading }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
      padding: "18px 20px", display: "flex", alignItems: "center",
      gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: "linear-gradient(135deg, #8b5cf620, #8b5cf640)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0
      }}>
        👑
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>
          {chef.prenom} {chef.nom}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          {chef.email}
        </div>
        <div style={{ fontSize: 12, color: "#8b5cf6", marginTop: 4, fontWeight: 500 }}>
          Service : {chef.service || chef.departement || "—"}
        </div>
      </div>
      <button
        onClick={() => onRetirer(chef.id)}
        disabled={loading}
        style={{
          padding: "7px 14px", border: "1px solid #fca5a5", borderRadius: 8,
          background: "none", color: "#dc2626", cursor: "pointer", fontSize: 13,
          opacity: loading ? 0.6 : 1
        }}
      >
        Retirer
      </button>
    </div>
  );
}

export default function NommerChef({ token }) {
  const [personnel, setPersonnel] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [form, setForm] = useState({ personnelId: "", service: "" });
  const [loading, setLoading] = useState(false);
  const [loadingRetrait, setLoadingRetrait] = useState(null);
  const [alert, setAlert] = useState(null);
  const [step, setStep] = useState(1);

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    fetch(`${API_BASE}/api/chef/personnel`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPersonnel(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API_BASE}/api/chef/chefs`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setChefs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }

  const nonChefs = personnel.filter(p => p.role !== "CHEF_SERVICE");
  const personnelChoisi = personnel.find(p => String(p.id) === String(form.personnelId));

  const SERVICES = [
    "Cardiologie", "Neurologie", "Pédiatrie", "Urgences",
    "Chirurgie", "Radiologie", "Oncologie", "Psychiatrie",
    "Gynécologie", "Orthopédie", "Dermatologie", "Ophtalmologie"
  ];

  async function nommerChef() {
    if (!form.personnelId || !form.service) {
      setAlert({ type: "error", message: "Veuillez sélectionner un membre du personnel et un service." });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/chef/nommer`, {
        method: "POST",
        headers,
        body: JSON.stringify({ personnelId: Number(form.personnelId), service: form.service })
      });
      if (r.ok) {
        setAlert({ type: "success", message: `${personnelChoisi?.prenom} ${personnelChoisi?.nom} a été nommé(e) chef du service ${form.service} avec succès !` });
        setForm({ personnelId: "", service: "" });
        setStep(1);
        loadData();
      } else {
        const err = await r.text();
        setAlert({ type: "error", message: err || "Erreur lors de la nomination." });
      }
    } catch {
      setAlert({ type: "error", message: "Erreur réseau. Vérifiez que le service est démarré." });
    }
    setLoading(false);
  }

  async function retirerChef(personnelId) {
    if (!window.confirm("Retirer ce chef de service ?")) return;
    setLoadingRetrait(personnelId);
    try {
      const r = await fetch(`${API_BASE}/api/chef/retirer/${personnelId}`, { method: "DELETE", headers });
      if (r.ok) {
        setAlert({ type: "success", message: "Chef de service retiré." });
        loadData();
      } else {
        setAlert({ type: "error", message: "Erreur lors du retrait." });
      }
    } catch {
      setAlert({ type: "error", message: "Erreur réseau." });
    }
    setLoadingRetrait(null);
  }

  const canNext = step === 1 ? !!form.personnelId : !!form.service;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 680 }}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Formulaire de nomination */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 32 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #f8fafc, #f0f4ff)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>👑</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Nommer un chef de service</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Attribuez le rôle de chef de service à un membre du personnel</p>
            </div>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
          {[1, 2].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < 1 ? "none" : 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: step >= s ? "#8b5cf6" : "#f1f5f9",
                color: step >= s ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, flexShrink: 0
              }}>
                {step > s ? "✓" : s}
              </div>
              <span style={{ fontSize: 13, color: step >= s ? "#0f172a" : "#94a3b8", fontWeight: step === s ? 600 : 400, whiteSpace: "nowrap" }}>
                {s === 1 ? "Choisir le personnel" : "Choisir le service"}
              </span>
              {i === 0 && (
                <div style={{ flex: 1, height: 1, background: step > 1 ? "#8b5cf6" : "#e2e8f0", marginLeft: 4, marginRight: 4 }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {step === 1 && (
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 12 }}>
                Sélectionner un membre du personnel
              </label>
              {nonChefs.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
                  Aucun membre du personnel disponible pour la nomination.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                  {nonChefs.map(p => {
                    const isSelected = String(form.personnelId) === String(p.id);
                    const roleColors = { DOCTOR: "#0ea5e9", NURSE: "#10b981", SECRETARY: "#f59e0b" };
                    const roleLabels = { DOCTOR: "Médecin", NURSE: "Infirmier(e)", SECRETARY: "Secrétaire" };
                    const rColor = roleColors[p.role] || "#64748b";
                    return (
                      <div
                        key={p.id}
                        onClick={() => setForm(f => ({ ...f, personnelId: String(p.id) }))}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                          border: isSelected ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                          background: isSelected ? "#faf5ff" : "#fff",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: rColor + "20",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: rColor, flexShrink: 0
                        }}>
                          {(p.prenom?.[0] || "") + (p.nom?.[0] || "")}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14, color: "#0f172a" }}>{p.prenom} {p.nom}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{p.email}</div>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
                          background: rColor + "15", color: rColor
                        }}>
                          {roleLabels[p.role] || p.role}
                        </span>
                        {isSelected && (
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 }}>✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              {personnelChoisi && (
                <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>👤</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{personnelChoisi.prenom} {personnelChoisi.nom}</div>
                    <div style={{ fontSize: 12, color: "#7c3aed" }}>Sera nommé(e) chef du service sélectionné</div>
                  </div>
                </div>
              )}

              <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 12 }}>
                Sélectionner le service
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                {SERVICES.map(svc => {
                  const isSelected = form.service === svc;
                  return (
                    <div
                      key={svc}
                      onClick={() => setForm(f => ({ ...f, service: svc }))}
                      style={{
                        padding: "10px 14px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                        border: isSelected ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                        background: isSelected ? "#faf5ff" : "#f8fafc",
                        color: isSelected ? "#7c3aed" : "#374151",
                        fontSize: 13, fontWeight: isSelected ? 600 : 400,
                        transition: "all 0.15s"
                      }}
                    >
                      {svc}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Ou saisir un service personnalisé :</label>
                <input
                  type="text"
                  placeholder="Nom du service..."
                  value={SERVICES.includes(form.service) ? "" : form.service}
                  onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", boxSizing: "border-box" }}
                />
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              style={{
                padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 8,
                background: "none", color: "#374151", cursor: step === 1 ? "not-allowed" : "pointer",
                fontSize: 14, opacity: step === 1 ? 0.4 : 1
              }}
            >← Précédent</button>

            {step < 2 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!canNext}
                style={{
                  padding: "9px 24px", border: "none", borderRadius: 8,
                  background: canNext ? "#8b5cf6" : "#e2e8f0",
                  color: canNext ? "#fff" : "#94a3b8",
                  cursor: canNext ? "pointer" : "not-allowed",
                  fontSize: 14, fontWeight: 500
                }}
              >Suivant →</button>
            ) : (
              <button
                onClick={nommerChef}
                disabled={loading || !form.service}
                style={{
                  padding: "9px 28px", border: "none", borderRadius: 8,
                  background: (loading || !form.service) ? "#e2e8f0" : "#8b5cf6",
                  color: (loading || !form.service) ? "#94a3b8" : "#fff",
                  cursor: (loading || !form.service) ? "not-allowed" : "pointer",
                  fontSize: 14, fontWeight: 500
                }}
              >
                {loading ? "Nomination en cours..." : "👑 Nommer chef"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des chefs actuels */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Chefs de service actuels</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            {chefs.length === 0 ? "Aucun chef de service nommé." : `${chefs.length} chef${chefs.length > 1 ? "s" : ""} de service`}
          </p>
        </div>
        <div style={{ padding: 20 }}>
          {chefs.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
              <div style={{ fontSize: 14 }}>Aucun chef de service n'a encore été nommé.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {chefs.map(chef => (
                <ChefCard
                  key={chef.id}
                  chef={chef}
                  onRetirer={retirerChef}
                  loading={loadingRetrait === chef.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
