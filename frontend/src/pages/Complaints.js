import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const statusColor = { pending:"#f59e0b", "in-progress":"#3b82f6", resolved:"#10b981", rejected:"#ef4444" };
const priorityColor = { low:"#10b981", medium:"#f59e0b", high:"#ef4444" };
const inp = { width:"100%", padding:"9px 12px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13, outline:"none" };

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ title:"", description:"", category:"other", priority:"medium", isAnonymous:false });
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const canManage = user?.role === "admin" || user?.role === "teacher";

  const load = () => {
    api.get(`/complaints${filterStatus?`?status=${filterStatus}`:""}`).then(r=>setComplaints(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); }, [filterStatus]);

  const submit = async () => {
    if (!form.title || !form.description) return toast.error("Title and description required");
    const { data } = await api.post("/complaints", form).catch(err=>{ toast.error(err.response?.data?.message||"Error"); return {}; });
    if (data) { setComplaints(p=>[data,...p]); setShowForm(false); setForm({ title:"", description:"", category:"other", priority:"medium", isAnonymous:false }); toast.success("Complaint submitted!"); }
  };

  const updateStatus = async () => {
    if (!newStatus) return;
    const { data } = await api.patch(`/complaints/${selected._id}/status`, { status:newStatus, response }).catch(()=>({ data:null }));
    if (data) {
      setComplaints(p=>p.map(c=>c._id===data._id?data:c));
      setSelected(data);
      toast.success("Status updated!");
    }
  };

  return (
    <div style={{ padding:24, maxWidth:900, margin:"0 auto" }} className="fade-in">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>Complaints</h1>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>Submit and track issues</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ padding:"9px 16px", borderRadius:8, background:"linear-gradient(135deg,#f59e0b,#ef4444)", border:"none", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer" }}>
          + File Complaint
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        {["","pending","in-progress","resolved","rejected"].map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{
            padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border:"1px solid var(--border)",
            background: filterStatus===s ? (statusColor[s]||"linear-gradient(135deg,#3b82f6,#6366f1)"):"var(--bg3)",
            color: filterStatus===s ? "#fff":"var(--text2)",
          }}>{s||"All"}</button>
        ))}
      </div>

      {/* File Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:24, width:440, maxWidth:"90vw" }}>
            <h2 style={{ fontWeight:600, fontSize:16, marginBottom:16 }}>File a Complaint</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Title</label>
                <input style={inp} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Description</label>
                <textarea style={{ ...inp, minHeight:90, resize:"vertical" }} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {["academic","infrastructure","hostel","library","other"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Priority</label>
                  <select style={inp} value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                    {["low","medium","high"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
                <input type="checkbox" checked={form.isAnonymous} onChange={e=>setForm(p=>({...p,isAnonymous:e.target.checked}))} />
                Submit anonymously
              </label>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:"10px", borderRadius:8, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", cursor:"pointer" }}>Cancel</button>
              <button onClick={submit} style={{ flex:1, padding:"10px", borderRadius:8, background:"linear-gradient(135deg,#f59e0b,#ef4444)", border:"none", color:"#fff", fontWeight:600, cursor:"pointer" }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:24, width:480, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontWeight:600, fontSize:16 }}>{selected.title}</h2>
              <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:20 }}>×</button>
            </div>
            <p style={{ fontSize:13, color:"var(--text2)", marginBottom:12, lineHeight:1.6 }}>{selected.description}</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16, fontSize:12 }}>
              <span style={{ padding:"2px 10px", borderRadius:10, background:statusColor[selected.status]+"22", color:statusColor[selected.status] }}>{selected.status}</span>
              <span style={{ padding:"2px 10px", borderRadius:10, background:priorityColor[selected.priority]+"22", color:priorityColor[selected.priority] }}>{selected.priority} priority</span>
              <span style={{ color:"var(--text3)" }}>{selected.category}</span>
            </div>
            {selected.response && (
              <div style={{ background:"var(--bg3)", borderRadius:8, padding:12, marginBottom:16, borderLeft:"3px solid var(--accent)" }}>
                <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>Admin Response</div>
                <p style={{ fontSize:13, color:"var(--text2)" }}>{selected.response}</p>
              </div>
            )}
            {canManage && (
              <div style={{ display:"flex", flexDirection:"column", gap:10, borderTop:"1px solid var(--border)", paddingTop:16 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text2)" }}>Update Status</div>
                <select style={inp} value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  <option value="">-- Select status --</option>
                  {["pending","in-progress","resolved","rejected"].map(s=><option key={s}>{s}</option>)}
                </select>
                <textarea style={{ ...inp, minHeight:70, resize:"vertical" }} placeholder="Response / remarks..." value={response} onChange={e=>setResponse(e.target.value)} />
                <button onClick={updateStatus} style={{ padding:"10px", borderRadius:8, background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff", fontWeight:600, cursor:"pointer" }}>Update</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <p style={{ color:"var(--text3)" }}>Loading...</p> : complaints.length===0 ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--text3)" }}>No complaints found</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {complaints.map(c=>(
            <div key={c._id} onClick={()=>{ setSelected(c); setNewStatus(c.status); setResponse(c.response||""); }}
              style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16, cursor:"pointer", transition:"border-color 0.15s", borderLeft:`3px solid ${statusColor[c.status]}` }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=statusColor[c.status]}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <h3 style={{ fontSize:14, fontWeight:600 }}>{c.title}</h3>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:statusColor[c.status]+"22", color:statusColor[c.status] }}>{c.status}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:priorityColor[c.priority]+"22", color:priorityColor[c.priority] }}>{c.priority}</span>
                </div>
              </div>
              <p style={{ fontSize:12, color:"var(--text2)", marginBottom:6, lineHeight:1.5 }}>{c.description.slice(0,120)}{c.description.length>120?"...":""}</p>
              <div style={{ fontSize:11, color:"var(--text3)", display:"flex", gap:10 }}>
                <span>{c.category}</span>
                {canManage && !c.isAnonymous && c.submittedBy && <span>by {c.submittedBy.name}</span>}
                <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
