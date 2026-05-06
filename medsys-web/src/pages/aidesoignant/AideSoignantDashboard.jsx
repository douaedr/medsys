import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import MesTachesHygiene from "./MesTachesHygiene";

export default function AideSoignantDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Espace Aide Soignant</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>
        <MesTachesHygiene />
      </div>
    </DashboardLayout>
  );
}
