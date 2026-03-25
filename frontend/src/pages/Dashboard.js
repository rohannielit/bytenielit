import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../utils/api";

const Card = ({ children, style }) => (
  <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, ...style }}>
    {children}
  </div>
);

const StatCard = ({ label, value, color, to }) => (
  <Link to={to} style={{ textDecoration:"none", width:"100%", boxSizing:"border-box" }}>
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, cursor:"pointer", transition:"border-color 0.15s", width:"100%", boxSizing:"border-box" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=color}
      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
      <div style={{ fontSize:28, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:13, color:"var(--text2)", marginTop:4 }}>{label}</div>
    </div>
  </Link>
);

const typeColor = { holiday:"#10b981", event:"#3b82f6", exam:"#ef4444", deadline:"#f59e0b", other:"#8b5cf6" };
const roleColor = { admin:"#ef4444", teacher:"#f59e0b", student:"#10b981" };

export default function Dashboard() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/events/upcoming"),
      api.get("/notes"),
      api.get("/complaints"),
      api.get("/users"),
    ]).then(([ev, nt, cp, us]) => {
      setEvents(ev.data.slice(0,5));
      setNotes(nt.data.slice(0,5));
      setComplaints(cp.data);
      setUsers(us.data.slice(0,20));
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const pending = complaints.filter(c=>c.status==="pending").length;

  return (
    <div style={{ padding:28, maxWidth:1200, margin:"0 auto" }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
  <img src="/logo1.png" alt="NIELIT" style={{ width:60, height:60, objectFit:"contain", background:"#fff", borderRadius:10, padding:4 }} />
  <div>
    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px" }}>{greet()}, {user?.name?.split(" ")[0]} 👋</h1>
    <p style={{ color:"var(--text2)", fontSize:13, marginTop:2 }}>NIELIT Jorhat EC · ByteNIELIT</p>
  </div>
</div>
        <p style={{ color:"var(--text2)", fontSize:14, marginTop:4 }}>
          {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          {user?.branch && ` · ${user.branch} Sem ${user?.semester}`}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"16px", width:"100%", marginBottom:28 }}>
        <StatCard label="Upcoming Events" value={events.length} color="#3b82f6" to="/events" />
        <StatCard label="Notes & Files" value={notes.length} color="#8b5cf6" to="/notes" />
        <StatCard label="Pending Complaints" value={pending} color="#ef4444" to="/complaints" />
        <StatCard label="Online Now" value={onlineUsers.length} color="#10b981" to="/chat" />
      </div>

<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(380px, 1fr))", gap:18 }}>
        {/* Upcoming Events */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:600 }}>Upcoming Events</h2>
            <Link to="/events" style={{ fontSize:12, color:"var(--accent)" }}>View all →</Link>
          </div>
          {loading ? <p style={{ color:"var(--text3)", fontSize:13 }}>Loading...</p> :
            events.length === 0 ? <p style={{ color:"var(--text3)", fontSize:13 }}>No upcoming events</p> :
            events.map(ev => (
              <div key={ev._id} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:typeColor[ev.type]||"#8b5cf6", marginTop:5, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>
                    {new Date(ev.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                    {ev.venue && ` · ${ev.venue}`}
                  </div>
                </div>
                <span style={{ marginLeft:"auto", fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:20, background:typeColor[ev.type]+"22", color:typeColor[ev.type] }}>
                  {ev.type}
                </span>
              </div>
            ))
          }
        </Card>

        {/* Recent Notes */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:600 }}>Recent Notes</h2>
            <Link to="/notes" style={{ fontSize:12, color:"var(--accent)" }}>View all →</Link>
          </div>
          {loading ? <p style={{ color:"var(--text3)", fontSize:13 }}>Loading...</p> :
            notes.length === 0 ? <p style={{ color:"var(--text3)", fontSize:13 }}>No notes yet</p> :
            notes.map(n => (
              <div key={n._id} style={{ padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{n.title}</span>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:"#3b82f622", color:"#3b82f6" }}>{n.type}</span>
                </div>
                <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>
                  {n.subject} · by {n.uploadedBy?.name}
                </div>
              </div>
            ))
          }
        </Card>

        {/* Online Users */}
        <Card>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Online Now ({onlineUsers.length})</h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {onlineUsers.slice(0,12).map((u,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:"var(--bg3)", padding:"5px 10px", borderRadius:20, fontSize:12 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block" }} />
                {u.name}
                <span style={{ fontSize:10, color:"var(--text3)", textTransform:"capitalize" }}>({u.role})</span>
              </div>
            ))}
            {onlineUsers.length === 0 && <p style={{ color:"var(--text3)", fontSize:13 }}>No one online right now</p>}
          </div>
        </Card>

        {/* All Members */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>All Members ({users.length})</h2>
            <Link to="/admin" style={{ fontSize: 12, color: "var(--accent)" }}>View all →</Link>
          </div>
          {loading ? (
            <p style={{ color: "var(--text3)", fontSize: 13 }}>Loading members...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--text3)", fontSize: 13 }}>No members found</p>
          ) : (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {users.map((u) => {
                const isOnline = onlineUsers.some(ou => ou.name === u.name);
                return (
                  <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: `${roleColor[u.role] || "#3b82f6"}33`,
                      border: `2px solid ${roleColor[u.role] || "#3b82f6"}66`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 15, color: roleColor[u.role] || "#3b82f6",
                      flexShrink: 0
                    }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>
                        {u.branch && `${u.branch}`} {u.semester && `Sem ${u.semester}`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "3px 8px", borderRadius: 12,
                      background: `${roleColor[u.role] || "#3b82f6"}22`,
                      color: roleColor[u.role] || "#3b82f6"
                    }}>
                      {u.role}
                    </span>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: isOnline ? "var(--green)" : "#64748b",
                      flexShrink: 0
                    }} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Quick Actions</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Go to Chat", to:"/chat", color:"#3b82f6" },
              { label:"View Timetable", to:"/timetable", color:"#8b5cf6" },
              { label:"Upload Notes", to:"/notes", color:"#10b981" },
              { label:"File Complaint", to:"/complaints", color:"#f59e0b" },
            ].map(({ label, to, color }) => (
              <Link key={to} to={to} style={{
                padding:"12px", borderRadius:8, border:`1px solid ${color}44`, background:`${color}11`,
                color, fontSize:13, fontWeight:500, textAlign:"center", transition:"background 0.15s",
              }}>{label}</Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
