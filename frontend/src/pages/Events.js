import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const typeColor = { holiday:"#10b981", event:"#3b82f6", exam:"#ef4444", deadline:"#f59e0b", other:"#8b5cf6" };
const typeIcon = { holiday:"🎉", event:"📅", exam:"📝", deadline:"⏰", other:"📌" };

const inp = {
  width:"100%", padding:"9px 12px", background:"var(--bg3)",
  border:"1px solid var(--border)", borderRadius:8,
  color:"var(--text)", fontSize:13, outline:"none",
};

// Perfectly centered modal — works with sidebar
const Overlay = ({ children, onClose }) => (
  <div
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    style={{
      position:"fixed",
      top:0, left:0,
      width:"100%", height:"100%",
      background:"rgba(0,0,0,0.7)",
      display:"flex",
      alignItems:"flex-start",
      justifyContent:"center",
      paddingTop:"0px",
      zIndex:99999,
    }}
  >
    {children}
  </div>
);

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", date:"", endDate:"", type:"event", venue:"" });
  const canEdit = user?.role === "admin" || user?.role === "teacher";
  const set = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));

  useEffect(() => {
    api.get("/events")
      .then(r => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!form.title || !form.date) return toast.error("Title and date required");
    try {
      const { data } = await api.post("/events", form);
      setEvents(p => [...p, data].sort((a,b) => new Date(a.date)-new Date(b.date)));
      setShowForm(false);
      setForm({ title:"", description:"", date:"", endDate:"", type:"event", venue:"" });
      toast.success("Event created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event");
    }
  };

  const del = async (id) => {
    await api.delete(`/events/${id}`).catch(()=>{});
    setEvents(p => p.filter(e => e._id !== id));
    toast.success("Deleted");
  };

  const upcoming = events.filter(e => new Date(e.date) >= new Date());
  const past = events.filter(e => new Date(e.date) < new Date());

  const EventCard = ({ ev }) => (
    <div style={{
      background:"var(--card)", border:"1px solid var(--border)",
      borderRadius:12, padding:16, position:"relative",
      borderLeft:`3px solid ${typeColor[ev.type]||"#8b5cf6"}`,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <span style={{
          fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10,
          background:`${typeColor[ev.type]}22`, color:typeColor[ev.type], textTransform:"uppercase",
        }}>
          {typeIcon[ev.type]} {ev.type}
        </span>
        {canEdit && (
          <button onClick={() => del(ev._id)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:16 }}>×</button>
        )}
      </div>
      <h3 style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{ev.title}</h3>
      {ev.description && (
        <p style={{ fontSize:12, color:"var(--text2)", marginBottom:6, lineHeight:1.5 }}>{ev.description}</p>
      )}
      <div style={{ fontSize:11, color:"var(--text3)", display:"flex", gap:10, flexWrap:"wrap" }}>
        <span>📅 {new Date(ev.date).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}</span>
        {ev.venue && <span>📍 {ev.venue}</span>}
        {ev.createdBy && <span>by {ev.createdBy.name}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ padding:24, maxWidth:900, margin:"0 auto" }} className="fade-in">

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>Events & Holidays</h1>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>Academic calendar</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} style={{
            padding:"9px 16px", borderRadius:8,
            background:"linear-gradient(135deg,#3b82f6,#6366f1)",
            border:"none", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer",
          }}>
            + Add Event
          </button>
        )}
      </div>

      {/* ADD EVENT MODAL — PERFECTLY CENTERED */}
      {showForm && (
        <Overlay onClose={() => setShowForm(false)}>
          <div style={{
            background:"var(--card)",
            border:"1px solid var(--border)",
            borderRadius:16,
            padding:28,
            width:440,
            maxWidth:"calc(100vw - 40px)",
            maxHeight:"calc(100vh - 60px)",
            overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
          }}>
            {/* Modal header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontWeight:700, fontSize:17 }}>Add Event / Holiday</h2>
              <button onClick={() => setShowForm(false)} style={{
                background:"none", border:"none", color:"var(--text3)",
                cursor:"pointer", fontSize:24, lineHeight:1, padding:"0 4px",
              }}>×</button>
            </div>

            {/* Form fields */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Title *</label>
                <input style={inp} placeholder="e.g. Mid Semester Exam" value={form.title} onChange={set("title")} />
              </div>

              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Description</label>
                <textarea style={{ ...inp, minHeight:80, resize:"vertical", lineHeight:1.6 }}
                  placeholder="Add details about this event..."
                  value={form.description} onChange={set("description")} />
              </div>

              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Venue / Location</label>
                <input style={inp} placeholder="e.g. Main Hall, Room 101" value={form.venue} onChange={set("venue")} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Type</label>
                  <select style={inp} value={form.type} onChange={set("type")}>
                    {["event","holiday","exam","deadline","other"].map(t => (
                      <option key={t} value={t}>{typeIcon[t]} {t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Date *</label>
                  <input style={inp} type="date" value={form.date} onChange={set("date")} />
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>End Date (optional)</label>
                <input style={inp} type="date" value={form.endDate} onChange={set("endDate")} />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button onClick={() => setShowForm(false)} style={{
                flex:1, padding:"11px", borderRadius:8,
                background:"var(--bg3)", border:"1px solid var(--border)",
                color:"var(--text)", cursor:"pointer", fontWeight:500, fontSize:14,
              }}>Cancel</button>
              <button onClick={submit} style={{
                flex:1, padding:"11px", borderRadius:8,
                background:"linear-gradient(135deg,#3b82f6,#6366f1)",
                border:"none", color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer",
              }}>Save Event</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Events list */}
      {loading ? (
        <p style={{ color:"var(--text3)" }}>Loading...</p>
      ) : (
        <>
          <h2 style={{ fontSize:14, fontWeight:600, color:"var(--text2)", marginBottom:12 }}>
            Upcoming ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <p style={{ color:"var(--text3)", fontSize:13, marginBottom:24 }}>No upcoming events</p>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12, marginBottom:28 }}>
              {upcoming.map(ev => <EventCard key={ev._id} ev={ev} />)}
            </div>
          )}

          {past.length > 0 && (
            <>
              <h2 style={{ fontSize:14, fontWeight:600, color:"var(--text3)", marginBottom:12 }}>Past Events</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12, opacity:0.6 }}>
                {past.map(ev => <EventCard key={ev._id} ev={ev} />)}
              </div>
            </>
          )}

          {events.length === 0 && (
            <div style={{ textAlign:"center", padding:60, color:"var(--text3)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
              <div style={{ fontSize:14 }}>No events yet</div>
              {canEdit && <div style={{ fontSize:12, marginTop:6 }}>Click "+ Add Event" to create one</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}