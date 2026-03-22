import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const typeColor = { note:"#3b82f6", assignment:"#f59e0b", pyq:"#8b5cf6", other:"#10b981" };
const inp = { width:"100%", padding:"9px 12px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13, outline:"none" };

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ type:"", subject:"" });
  const [form, setForm] = useState({ title:"", description:"", subject:"", semester: user?.semester||1, type:"note", tags:"" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    // Only send non-empty filters
    const params = {};
    if (filter.type) params.type = filter.type;
    if (filter.subject && filter.subject.trim()) params.subject = filter.subject.trim();
    const q = new URLSearchParams(params).toString();
    api.get(`/notes${q ? "?" + q : ""}`)
      .then(r => setNotes(r.data))
      .catch((err) => {
        console.error("Notes load error:", err);
        toast.error("Failed to load notes");
      })
      .finally(() => setLoading(false));
  };

  useEffect(()=>{ load(); }, [filter]);

  const submit = async () => {
    if (!form.title || !form.subject) return toast.error("Title and subject required");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      if (file) fd.append("file", file);
      const { data } = await api.post("/notes", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      setNotes(p=>[data,...p]);
      setShowForm(false);
      setForm({ title:"", description:"", subject:"", semester:user?.semester||1, type:"note", tags:"" });
      setFile(null);
      toast.success("Uploaded!");
    } catch { toast.error("Upload failed"); }
    finally { setSaving(false); }
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`).catch(()=>{});
    setNotes(p=>p.filter(n=>n._id!==id));
    toast.success("Deleted");
  };

  return (
    <div style={{ padding:24, maxWidth:1100, margin:"0 auto" }} className="fade-in">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>Notes & Assignments</h1>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>Study materials, assignments, PYQs</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ padding:"9px 16px", borderRadius:8, background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer" }}>
          + Upload
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {["","note","assignment","pyq","other"].map(t=>(
          <button key={t} onClick={()=>setFilter(p=>({...p,type:t}))} style={{
            padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border:"1px solid var(--border)",
            background: filter.type===t ? "linear-gradient(135deg,#3b82f6,#6366f1)":"var(--bg3)",
            color: filter.type===t ? "#fff":"var(--text2)",
          }}>{t||"All"}</button>
        ))}
        <input value={filter.subject} onChange={e=>setFilter(p=>({...p,subject:e.target.value}))}
          placeholder="Filter by subject..." style={{ ...inp, width:180, marginLeft:"auto" }} />
      </div>

      {/* Upload Modal */}
      {showForm && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, width:"100vw", height:"100vh", background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:24, width:440, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
            <h2 style={{ fontWeight:600, fontSize:16, marginBottom:16 }}>Upload Material</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["Title","title","text"],["Subject","subject","text"],["Description","description","text"]].map(([lbl,key,type])=>(
                <div key={key}>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>{lbl}</label>
                  <input style={inp} type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} />
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Type</label>
                  <select style={inp} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    {["note","assignment","pyq","other"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Semester</label>
                  <select style={inp} value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))}>
                    {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Tags (comma separated)</label>
                <input style={inp} value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="e.g. OS, Unit-2, Important" />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>File (PDF, Image, Doc)</label>
                <input type="file" accept=".pdf,.jpg,.png,.docx,.pptx" onChange={e=>setFile(e.target.files[0])}
                  style={{ fontSize:12, color:"var(--text2)" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:"10px", borderRadius:8, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", cursor:"pointer" }}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{ flex:1, padding:"10px", borderRadius:8, background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff", fontWeight:600, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving?"Uploading...":"Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? <p style={{ color:"var(--text3)", fontSize:13 }}>Loading...</p> : notes.length === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--text3)" }}>No notes found</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {notes.map(n=>(
            <div key={n._id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16, display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <span style={{ fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:10, background:typeColor[n.type]+"22", color:typeColor[n.type], textTransform:"uppercase" }}>{n.type}</span>
                {(user?.role==="admin"||user?.role==="teacher") && (
                  <button onClick={()=>deleteNote(n._id)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:16 }}>×</button>
                )}
              </div>
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:4, lineHeight:1.4 }}>{n.title}</h3>
              <p style={{ fontSize:12, color:"var(--text2)", marginBottom:8 }}>{n.subject} · Sem {n.semester}</p>
              {n.description && <p style={{ fontSize:12, color:"var(--text3)", marginBottom:8, lineHeight:1.5 }}>{n.description}</p>}
              {n.tags?.length>0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                  {n.tags.map(t=><span key={t} style={{ fontSize:10, background:"var(--bg3)", color:"var(--text2)", padding:"2px 7px", borderRadius:10 }}>{t}</span>)}
                </div>
              )}
              <div style={{ marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid var(--border)" }}>
                <span style={{ fontSize:11, color:"var(--text3)" }}>by {n.uploadedBy?.name}</span>
                {n.fileUrl && (
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    {n.fileUrl.toLowerCase().includes(".pdf") || n.fileName?.toLowerCase().endsWith(".pdf") ? (
                      <>
                        <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(n.fileUrl)}&embedded=true`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize:12, color:"var(--accent)", fontWeight:600, textDecoration:"none",
                            padding:"4px 10px", borderRadius:6, background:"#3b82f622", display:"inline-block" }}>
                          View PDF ↗
                        </a>
                        <a href={n.fileUrl} download target="_blank" rel="noopener noreferrer"
                          style={{ fontSize:12, color:"#10b981", fontWeight:600, textDecoration:"none",
                            padding:"4px 10px", borderRadius:6, background:"#10b98122", display:"inline-block" }}>
                          Download ⬇
                        </a>
                      </>
                    ) : (
                      <a href={n.fileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:12, color:"var(--accent)", fontWeight:600, textDecoration:"none",
                          padding:"4px 10px", borderRadius:6, background:"#3b82f622", display:"inline-block" }}>
                        Open file ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}