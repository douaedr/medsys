import React, { useEffect, useState, useCallback } from "react";
import { getSlots, isWeekFull } from "../services/api";
import * as signalR from "@microsoft/signalr";

const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}

function formatDateOnly(date) {
  return date.toISOString().split("T")[0];
}

const STATUS_COLORS = {
  Available: { bg:"#dcfce7", color:"#16a34a", border:"#16a34a", label:"Disponible" },
  Reserved:  { bg:"#fee2e2", color:"#dc2626", border:"#dc2626", label:"Réservé" },
  Blocked:   { bg:"#f3f4f6", color:"#6b7280", border:"#9ca3af", label:"Bloqué" },
  Cancelled: { bg:"#fef9c3", color:"#ca8a04", border:"#ca8a04", label:"Annulé" },
};

export default function Calendar({ doctorId = 1, onSlotSelect, role }) {
  const [slots, setSlots] = useState([]);
  const [weekStart, setWeekStart] = useState(getMondayOf(new Date()));
  const [loading, setLoading] = useState(false);
  const [weekFull, setWeekFull] = useState(false);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = formatDateOnly(weekStart);
      const [slotsRes, fullRes] = await Promise.all([
        getSlots(doctorId, dateStr),
        isWeekFull(doctorId, dateStr),
      ]);
      setSlots(slotsRes.data);
      setWeekFull(fullRes.data.isFull);
    } catch (e) {
      console.error("Erreur chargement créneaux", e);
    } finally {
      setLoading(false);
    }
  }, [doctorId, weekStart]);

  // SignalR — mises à jour temps réel
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/hubs/slots")
      .withAutomaticReconnect()
      .build();

    connection.on("SlotStatusChanged", ({ slotId, status }) => {
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status, isClickable: status === "Available" } : s));
    });

    connection.on("SlotAdded", (newSlot) => {
      setSlots(prev => [...prev, newSlot]);
    });

    connection.start().catch(e => console.warn("SignalR non connecté:", e.message));
    return () => connection.stop();
  }, []);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };

  // Grouper par jour
  const slotsByDay = Array.from({length:7}, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayStr = formatDateOnly(day);
    return {
      label: DAYS[i],
      date: day,
      dayStr,
      slots: slots.filter(s => s.startTime.startsWith(dayStr)),
    };
  });

  return (
    <div style={styles.container}>
      {/* Navigation semaine */}
      <div style={styles.header}>
        <button style={styles.navBtn} onClick={prevWeek}>← Semaine précédente</button>
        <span style={styles.weekLabel}>
          Semaine du {weekStart.toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}
        </span>
        <button style={styles.navBtn} onClick={nextWeek}>Semaine suivante →</button>
      </div>

      {loading && <p style={styles.loading}>Chargement des créneaux...</p>}

      {/* Légende */}
      <div style={styles.legend}>
        {Object.entries(STATUS_COLORS).map(([k,v]) => (
          <span key={k} style={{...styles.legendItem, background:v.bg, color:v.color, border:`1px solid ${v.border}`}}>
            {v.label}
          </span>
        ))}
      </div>

      {/* Grille des créneaux par jour */}
      <div style={styles.grid}>
        {slotsByDay.map(({ label, date, slots: daySlots }) => (
          <div key={label} style={styles.dayCol}>
            <div style={styles.dayHeader}>
              <strong>{label}</strong>
              <span style={styles.dayDate}>{date.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})}</span>
            </div>
            {daySlots.length === 0 ? (
              <div style={styles.noSlot}>—</div>
            ) : (
              daySlots.map(slot => {
                const st = STATUS_COLORS[slot.status] || STATUS_COLORS.Available;
                const clickable = slot.isClickable && slot.status === "Available";
                return (
                  <button
                    key={slot.id}
                    style={{
                      ...styles.slotBtn,
                      background: st.bg,
                      color: st.color,
                      border: `2px solid ${st.border}`,
                      opacity: clickable ? 1 : 0.6,
                      cursor: clickable ? "pointer" : "not-allowed",
                    }}
                    disabled={!clickable}
                    onClick={() => clickable && onSlotSelect && onSlotSelect(slot)}
                    title={slot.status}
                  >
                    {new Date(slot.startTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                    {" – "}
                    {new Date(slot.endTime).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                  </button>
                );
              })
            )}
          </div>
        ))}
      </div>

      {/* Alerte semaine complète */}
      {weekFull && (
        <div style={styles.fullAlert}>
          ⚠️ Tous les créneaux de cette semaine sont occupés.
          {role !== "Doctor" && role !== "Secretary" && (
            <span> Vous pouvez vous inscrire sur la <strong>liste d'attente</strong>.</span>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background:"white", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", flexWrap:"wrap", gap:"8px" },
  navBtn: { padding:"8px 16px", background:"#2563eb", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"14px" },
  weekLabel: { fontWeight:"700", color:"#1e3a5f", fontSize:"16px" },
  loading: { textAlign:"center", color:"#888", padding:"20px" },
  legend: { display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" },
  legendItem: { padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600" },
  grid: { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px", overflowX:"auto" },
  dayCol: { minWidth:"90px" },
  dayHeader: { textAlign:"center", padding:"8px 4px", background:"#f0f4f8", borderRadius:"8px", marginBottom:"6px" },
  dayDate: { display:"block", fontSize:"12px", color:"#888" },
  noSlot: { textAlign:"center", color:"#ccc", padding:"8px", fontSize:"20px" },
  slotBtn: { display:"block", width:"100%", padding:"8px 4px", borderRadius:"8px", fontSize:"12px", fontWeight:"600", marginBottom:"4px", transition:"all 0.2s" },
  fullAlert: { marginTop:"16px", padding:"16px", background:"#fef3c7", border:"1px solid #fcd34d", borderRadius:"10px", color:"#92400e", fontSize:"14px" },
};
