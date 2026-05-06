import { useState } from "react";
import { useToast } from '../../components/shared/Toast'
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import MesTachesHygiene from "./MesTachesHygiene";
import MonEmploiDuTemps from "../personnel/MonEmploiDuTemps";
import MessagesPanel from "../../components/messages/MessagesPanel";
import { useTab } from "../../lib/useTab";

export default function AideSoignantDashboard() {
  const { user } = useAuth();
  const [tab] = useTab("taches");

  const tabs = [
    { id: "taches", label: "Mes taches" },
    { id: "planning", label: "Mon planning" },
    { id: "messages", label: "Messagerie" },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Espace Aide Soignant</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>

        <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e2e8f0", marginBottom: "24px" }}>
          {tabs.map(t => (
            <a key={t.id} href={"?tab=" + t.id}
              style={{ padding: "8px 16px", fontSize: "14px", fontWeight: 500, textDecoration: "none",
                borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
                color: tab === t.id ? "#3b82f6" : "#64748b", marginBottom: "-2px" }}>
              {t.label}
            </a>
          ))}
        </div>

        <div>
          {tab === "taches" && <MesTachesHygiene />}
          {tab === "planning" && <MonEmploiDuTemps />}
          {tab === "messages" && <MessagesPanel />}
        </div>
      </div>
    </DashboardLayout>
  );
}
