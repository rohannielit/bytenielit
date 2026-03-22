import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const inp = { width:"100%", padding:"9px 12px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13, outline:"none" };
const roleColor = { admin:"#ef4444", teacher:"#f59e0b", student:"#3b82f6" };

export default function AdminPanel() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [stats, setStats] = useState({ total:0, students:0, teachers:0, admins:0 });
  const [notifForm, setNotifForm] = useState({ title:"", body:"", targetRole:"" });
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("users");

  useEffect(() => {
    api.get("/users")
      .then(r => {
        setUsers(r.data);
        setStats({
          total: r.data.length,
          students: r.data.filter(u=>u.role==="student").length,
          teachers: r.data.filter(u=>u.role==="teacher").length,
          admins: r.data.filter(u=>u.role==="admin").length,
        });
      })
      .catch(()=>toast.error("Failed to load users"))
      .finally(()=>setLoading(false));
  }, []);

  const changeRole = async (id, role) => {
    const { data } = await api.patch(`/users/${id}/role`, { role }).catch(()=>({ data:null }));
    if (data) {
      setUsers(p => p.map(u => u._id===id ? data : u));
      toast.success("Role updated");
    }
  };

  const sendNotification = async () => {
    if (!notifForm.title || !notifForm.body) return toast.error("Title and body required");
    setSending(true);
    try {
      const { data } = await api.post("/notifications/send", notifForm);
      toast.success(data.message);
      setNotifForm({ title:"", body:"", targetRole:"" });
    } catch {
      toast.error("Failed to send. Check FIREBASE_SERVER_KEY in .env");
    } finally { setSending(false); }
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole ? u.role === filterRole : true;
    const matchSearch = search ? (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : true;
    return matchRole && matchSearch;
  });

  return (
    <div style={{ padding:24, maxWidth:1000, margin:"0 auto" }} className="fade-in">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Admin Panel</h1>
        <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>Manage users, roles, and notifications</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[["Total Users",stats.total,"#3b82f6"],["Students",stats.students,"#10b981"],["Teachers",stats.teachers,"#f59e0b"],["Admins",stats.admins,"#ef4444"]].map(([lbl,val,color])=>(
          <div key={lbl} style={{ background:"var(--card)", border:`1px solid ${color}33`, borderRadius:12, padding:16, borderTop:`3px solid ${color}` }}>
            <div style={{ fontSize:26, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:12, color:"var(--text2)", marginTop:3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"var(--bg3)", padding:4, borderRadius:10, width:"fit-content" }}>
        {["users","notifications"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"7px 20px", borderRadius:8, border:"none", fontWeight:500, fontSize:13,
            background: tab===t ? "var(--card)":"transparent",
            color: tab===t ? "var(--text)":"var(--text2)", cursor:"pointer",
            boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,0.3)":"none",
          }}>
            {t === "users" ? "User Management" : "Push Notifications"}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          {/* Search + filter */}
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <input style={{ ...inp, flex:1, minWidth:200 }} placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
            <div style={{ display:"flex", gap:6 }}>
              {["","student","teacher","admin"].map(r=>(
                <button key={r} onClick={()=>setFilterRole(r)} style={{
                  padding:"7px 14px", borderRadius:20, border:"1px solid var(--border)", fontSize:12, fontWeight:500, cursor:"pointer",
                  background: filterRole===r ? (roleColor[r]||"linear-gradient(135deg,#3b82f6,#6366f1)"):"var(--bg3)",
                  color: filterRole===r ? "#fff":"var(--text2)",
                }}>{r||"All"}</button>
              ))}
            </div>
          </div>

          {loading ? <p style={{ color:"var(--text3)" }}>Loading...</p> : (
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"10px 18px", borderBottom:"1px solid var(--border)", fontSize:12, color:"var(--text3)" }}>
                Showing {filtered.length} of {users.length} users
              </div>
              {filtered.map((u, i) => (
                <div key={u._id} style={{
                  display:"flex", alignItems:"center", gap:14, padding:"12px 18px",
                  borderBottom: i < filtered.length-1 ? "1px solid var(--border)":"none",
                }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:`${roleColor[u.role]}22`, border:`2px solid ${roleColor[u.role]}44`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:roleColor[u.role], flexShrink:0 }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{u.name} {u._id === me?.id && <span style={{ fontSize:10, color:"var(--text3)" }}>(you)</span>}</div>
                    <div style={{ fontSize:11, color:"var(--text3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {u.email} {u.branch && `· ${u.branch}`} {u.semester && `Sem ${u.semester}`}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:`${roleColor[u.role]}22`, color:roleColor[u.role] }}>
                      {u.role}
                    </span>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background: u.isOnline?"#10b98122":"#64748b22", color: u.isOnline?"#10b981":"#64748b" }}>
                      {u.isOnline ? "online":"offline"}
                    </span>
                    {u._id !== me?.id && (
                      <select value={u.role} onChange={e=>changeRole(u._id, e.target.value)} style={{ ...inp, width:"auto", padding:"4px 8px", fontSize:12 }}>
                        {["student","teacher","admin"].map(r=><option key={r}>{r}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "notifications" && (
        <div style={{ maxWidth:520 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>Send Push Notification</h2>
            <p style={{ fontSize:12, color:"var(--text3)", marginBottom:20 }}>
              Sends to all users with FCM token registered. Requires <code style={{ background:"var(--bg3)", padding:"1px 5px", borderRadius:4 }}>FIREBASE_SERVER_KEY</code> in .env
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Title</label>
                <input style={inp} placeholder="e.g. Class cancelled today" value={notifForm.title} onChange={e=>setNotifForm(p=>({...p,title:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Message body</label>
                <textarea style={{ ...inp, minHeight:80, resize:"vertical" }} placeholder="e.g. Data Structures class is cancelled. Self-study." value={notifForm.body} onChange={e=>setNotifForm(p=>({...p,body:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Target audience</label>
                <select style={inp} value={notifForm.targetRole} onChange={e=>setNotifForm(p=>({...p,targetRole:e.target.value}))}>
                  <option value="">Everyone</option>
                  <option value="student">Students only</option>
                  <option value="teacher">Teachers only</option>
                  <option value="admin">Admins only</option>
                </select>
              </div>
              <button onClick={sendNotification} disabled={sending} style={{
                marginTop:4, padding:"11px", borderRadius:8,
                background:"linear-gradient(135deg,#f59e0b,#ef4444)", border:"none",
                color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer", opacity:sending?0.7:1,
              }}>
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>

            <div style={{ marginTop:20, padding:14, background:"var(--bg3)", borderRadius:8, fontSize:12, color:"var(--text3)", lineHeight:1.7 }}>
              <strong style={{ color:"var(--text2)" }}>Setup FCM in 3 steps:</strong><br/>
              1. Go to <strong>console.firebase.google.com</strong><br/>
              2. Project Settings → Cloud Messaging → copy <strong>Server Key</strong><br/>
              3. Paste it in your <code>.env</code> as <code>FIREBASE_SERVER_KEY</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
