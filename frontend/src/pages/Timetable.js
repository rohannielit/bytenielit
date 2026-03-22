import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const TYPES = { lecture:"#3b82f6", lab:"#10b981", tutorial:"#f59e0b" };

const inp = {
  width:"100%", padding:"9px 12px", background:"var(--bg3)",
  border:"1px solid var(--border)", borderRadius:8,
  color:"var(--text)", fontSize:13, outline:"none",
};

const modalOverlay = {
  position:"fixed", top:0, left:0, width:"100vw", height:"100vh",
  background:"rgba(0,0,0,0.65)", display:"flex",
  alignItems:"center", justifyContent:"center", zIndex:9999,
};

const modalBox = {
  background:"var(--card)", border:"1px solid var(--border)",
  borderRadius:16, padding:24, width:420, maxWidth:"90vw",
  maxHeight:"85vh", overflowY:"auto",
};

export default function Timetable() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState(user?.semester || 1);
  const [branch, setBranch] = useState(user?.branch || "BCA");
  const [showForm, setShowForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day:"Monday", startTime:"09:00", endTime:"10:00",
    subject:"", teacher:"", room:"", type:"lecture"
  });
  const [slots, setSlots] = useState([]);

  const canEdit = user?.role === "admin" || user?.role === "teacher";

  const load = () => {
    setLoading(true);
    api.get(`/timetable?semester=${semester}&branch=${branch}`)
      .then(r => setSlots(r.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [semester, branch]);

  const saveSlot = () => {
    if (!newSlot.subject) return toast.error("Subject is required");
    const updated = [...slots, { ...newSlot }];
    api.post("/timetable", { semester, branch, slots: updated })
      .then(r => {
        setSlots(r.data.slots);
        setShowForm(false);
        setNewSlot({ day:"Monday", startTime:"09:00", endTime:"10:00", subject:"", teacher:"", room:"", type:"lecture" });
        toast.success("Slot added!");
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Failed to save";
        console.error("Timetable save error:", err.response?.data);
        toast.error(msg);
      });
  };

  const removeSlot = (id) => {
    const updated = slots.filter(s => s._id !== id);
    api.post("/timetable", { semester, branch, slots: updated })
      .then(r => { setSlots(r.data.slots); toast.success("Removed"); })
      .catch(() => toast.error("Failed to remove"));
  };

  const daySlots = (day) =>
    slots.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));

  const set = (k) => (e) => setNewSlot(p => ({...p, [k]: e.target.value}));

  return (
    <div style={{ padding:24, maxWidth:1100, margin:"0 auto" }} className="fade-in">

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>Timetable</h1>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>
            Class schedule for {branch} · Sem {semester}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <select value={branch} onChange={e => setBranch(e.target.value)} style={{ ...inp, width:"auto" }}>
            {["BCA","O Level","A Level","CHE-T O-Level","PMKVY","CCC"].map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={semester} onChange={e => setSemester(+e.target.value)} style={{ ...inp, width:"auto" }}>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          {canEdit && (
            <button onClick={() => setShowForm(true)} style={{
              padding:"9px 16px", borderRadius:8,
              background:"linear-gradient(135deg,#3b82f6,#6366f1)",
              border:"none", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer",
            }}>
              + Add Slot
            </button>
          )}
        </div>
      </div>

      {/* Add Slot Modal — CENTERED */}
      {showForm && (
        <div style={modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) setShowForm(false); }}>
          <div style={modalBox}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ fontWeight:600, fontSize:16 }}>Add Class Slot</h2>
              <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Subject *</label>
                <input style={inp} placeholder="e.g. Data Structures" value={newSlot.subject} onChange={set("subject")} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Teacher Name</label>
                <input style={inp} placeholder="e.g. Prof. Sharma" value={newSlot.teacher} onChange={set("teacher")} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Room / Lab</label>
                <input style={inp} placeholder="e.g. Room 101" value={newSlot.room} onChange={set("room")} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Day</label>
                  <select style={inp} value={newSlot.day} onChange={set("day")}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Type</label>
                  <select style={inp} value={newSlot.type} onChange={set("type")}>
                    {["lecture","lab","tutorial"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Start Time</label>
                  <input style={inp} type="time" value={newSlot.startTime} onChange={set("startTime")} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>End Time</label>
                  <input style={inp} type="time" value={newSlot.endTime} onChange={set("endTime")} />
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={() => setShowForm(false)} style={{
                flex:1, padding:"10px", borderRadius:8,
                background:"var(--bg3)", border:"1px solid var(--border)",
                color:"var(--text)", cursor:"pointer", fontWeight:500,
              }}>Cancel</button>
              <button onClick={saveSlot} style={{
                flex:1, padding:"10px", borderRadius:8,
                background:"linear-gradient(135deg,#3b82f6,#6366f1)",
                border:"none", color:"#fff", fontWeight:600, cursor:"pointer",
              }}>Save Slot</button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      {loading ? (
        <p style={{ color:"var(--text3)", fontSize:13 }}>Loading timetable...</p>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14 }}>
          {DAYS.map(day => (
            <div key={day} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:13, background:"var(--bg3)" }}>
                {day}
              </div>
              <div style={{ padding:10, display:"flex", flexDirection:"column", gap:8, minHeight:80 }}>
                {daySlots(day).length === 0 && (
                  <p style={{ color:"var(--text3)", fontSize:12, textAlign:"center", padding:"12px 0" }}>Free</p>
                )}
                {daySlots(day).map(slot => (
                  <div key={slot._id} style={{
                    background:"var(--bg3)", borderRadius:8, padding:"8px 10px",
                    borderLeft:`3px solid ${TYPES[slot.type]||"#8b5cf6"}`,
                    position:"relative",
                  }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{slot.subject}</div>
                    <div style={{ fontSize:11, color:"var(--text2)" }}>{slot.startTime} – {slot.endTime}</div>
                    {slot.teacher && <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>{slot.teacher}</div>}
                    {slot.room && <div style={{ fontSize:11, color:"var(--text3)" }}>📍 {slot.room}</div>}
                    <span style={{
                      fontSize:10, background:`${TYPES[slot.type]||"#8b5cf6"}22`,
                      color:TYPES[slot.type]||"#8b5cf6", padding:"1px 6px",
                      borderRadius:10, display:"inline-block", marginTop:4,
                    }}>{slot.type}</span>
                    {canEdit && (
                      <button onClick={() => removeSlot(slot._id)} style={{
                        position:"absolute", top:6, right:6,
                        background:"none", border:"none", color:"var(--text3)",
                        cursor:"pointer", fontSize:15, lineHeight:1,
                      }}>×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && slots.length === 0 && (
        <div style={{ textAlign:"center", padding:40, color:"var(--text3)", marginTop:20 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
          <div style={{ fontSize:14 }}>No timetable yet for {branch} Sem {semester}</div>
          {canEdit && <div style={{ fontSize:12, marginTop:6 }}>Click "+ Add Slot" to create the timetable</div>}
          {!canEdit && <div style={{ fontSize:12, marginTop:6 }}>Ask your teacher or admin to add the timetable</div>}
        </div>
      )}
    </div>
  );
}