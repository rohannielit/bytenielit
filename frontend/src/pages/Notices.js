import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const priorityColor = { normal:"#3b82f6", important:"#f59e0b", urgent:"#ef4444" };
const priorityBg = { normal:"#3b82f611", important:"#f59e0b11", urgent:"#ef444411" };
const categoryColor = { academic:"#8b5cf6", exam:"#ef4444", holiday:"#10b981", general:"#3b82f6", fee:"#f59e0b", event:"#06b6d4" };
const categoryIcon = { academic:"📚", exam:"📝", holiday:"🎉", general:"📢", fee:"💰", event:"🎪" };

const inp = { width:"100%", padding:"9px 12px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13, outline:"none" };

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [form, setForm] = useState({ title:"", content:"", category:"general", priority:"normal" });
  const [saving, setSaving] = useState(false);
  const canPost = user?.role === "admin" || user?.role === "teacher";

  const load = () => {
    const q = new URLSearchParams();
    if (filterCategory) q.append("category", filterCategory);
    if (filterPriority) q.append("priority", filterPriority);
    api.get(`/notices?${q.toString()}`)
      .then(r => setNotices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterCategory, filterPriority]);

  const submit = async () => {
    if (!form.title || !form.content) return toast.error("Title and content required");
    setSaving(true);
    try {
      const { data } = await api.post("/notices", form);
      setNotices(p => [data, ...p]);
      setShowForm(false);
      setForm({ title:"", content:"", category:"general", priority:"normal" });
      toast.success("Notice posted!");
    } catch { toast.error("Failed to post notice"); }
    finally { setSaving(false); }
  };

  const deleteNotice = async (id) => {
    await api.delete(`/notices/${id}`).catch(() => {});
    setNotices(p => p.filter(n => n._id !== id));
    setSelected(null);
    toast.success("Notice deleted");
  };

  const openNotice = async (notice) => {
    setSelected(notice);
    await api.patch(`/notices/${notice._id}/view`).catch(() => {});
    setNotices(p => p.map(n => n._id === notice._id ? { ...n, views: n.views + 1 } : n));
  };

  const urgent = notices.filter(n => n.priority === "urgent");
  const rest = notices.filter(n => n.priority !== "urgent");

  return (
    <div style={{ padding:24, maxWidth:900, margin:"0 auto" }} className="fade-in">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>Notice Board</h1>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>
            Official announcements from NIELIT
          </p>
        </div>
        {canPost && (
          <button onClick={() => setShowForm(true)} style={{
            padding:"9px 16px", borderRadius:8,
            background:"linear-gradient(135deg,#f59e0b,#ef4444)",
            border:"none", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer",
          }}>
            + Post Notice
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {["","academic","exam","holiday","general","fee","event"].map(c => (
          <button key={c} onClick={() => setFilterCategory(c)} style={{
            padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:500,
            cursor:"pointer", border:"1px solid var(--border)",
            background: filterCategory===c ? (categoryColor[c]||"linear-gradient(135deg,#3b82f6,#6366f1)"):"var(--bg3)",
            color: filterCategory===c ? "#fff":"var(--text2)",
          }}>
            {c ? `${categoryIcon[c]} ${c}` : "All"}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          {["","normal","important","urgent"].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} style={{
              padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:500,
              cursor:"pointer", border:`1px solid ${priorityColor[p]||"var(--border)"}`,
              background: filterPriority===p ? (priorityColor[p]||"var(--bg3)"):"transparent",
              color: filterPriority===p ? "#fff":(priorityColor[p]||"var(--text2)"),
            }}>
              {p||"All priority"}
            </button>
          ))}
        </div>
      </div>

      {/* Post Notice Modal */}
      {showForm && (
        <div style={{ position: "fixed",top: 0,left: 0,right: 0,bottom: 0,width: "100vw",height: "100vh",background: "rgba(0,0,0,0.65)",display: "flex",alignItems: "center",justifyContent: "center",zIndex: 99999, }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:24, width:480, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
            <h2 style={{ fontWeight:600, fontSize:16, marginBottom:16 }}>Post New Notice</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Title *</label>
                <input style={inp} placeholder="e.g. Exam schedule for Sem 4" value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Content *</label>
                <textarea style={{ ...inp, minHeight:120, resize:"vertical", lineHeight:1.6 }}
                  placeholder="Write the full notice content here..."
                  value={form.content} onChange={e => setForm(p => ({...p, content:e.target.value}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                    {["general","academic","exam","holiday","fee","event"].map(c => (
                      <option key={c} value={c}>{categoryIcon[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Priority</label>
                  <select style={inp} value={form.priority} onChange={e => setForm(p => ({...p, priority:e.target.value}))}>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"10px", borderRadius:8, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", cursor:"pointer" }}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{ flex:1, padding:"10px", borderRadius:8, background:"linear-gradient(135deg,#f59e0b,#ef4444)", border:"none", color:"#fff", fontWeight:600, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving ? "Posting..." : "Post Notice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:24, width:520, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:10, background:priorityBg[selected.priority], color:priorityColor[selected.priority], textTransform:"uppercase" }}>
                  {selected.priority}
                </span>
                <span style={{ fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:10, background:categoryColor[selected.category]+"22", color:categoryColor[selected.category] }}>
                  {categoryIcon[selected.category]} {selected.category}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:20 }}>×</button>
            </div>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:12, lineHeight:1.4 }}>{selected.title}</h2>
            <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.8, marginBottom:16, whiteSpace:"pre-wrap" }}>{selected.content}</p>
            {selected.attachmentUrl && (
              <a href={selected.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginBottom:16, fontSize:13, color:"var(--accent)", fontWeight:500 }}>
                Download Attachment ↗
              </a>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid var(--border)", fontSize:11, color:"var(--text3)" }}>
              <span>Posted by {selected.postedBy?.name} ({selected.postedBy?.role})</span>
              <div style={{ display:"flex", gap:12 }}>
                <span>👁 {selected.views} views</span>
                <span>{new Date(selected.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
              </div>
            </div>
            {canPost && (
              <button onClick={() => deleteNotice(selected._id)} style={{ marginTop:14, width:"100%", padding:"9px", borderRadius:8, background:"#ef444411", border:"1px solid #ef444433", color:"#ef4444", fontWeight:500, fontSize:13, cursor:"pointer" }}>
                Delete Notice
              </button>
            )}
          </div>
        </div>
      )}

      {/* Urgent notices banner */}
      {urgent.length > 0 && !filterCategory && !filterPriority && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", display:"inline-block", animation:"pulse 1s infinite" }} />
            <span style={{ fontSize:13, fontWeight:600, color:"#ef4444" }}>URGENT NOTICES</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {urgent.map(n => (
              <div key={n._id} onClick={() => openNotice(n)} style={{
                background:"#ef444408", border:"1px solid #ef444433",
                borderLeft:"4px solid #ef4444", borderRadius:10, padding:"14px 16px",
                cursor:"pointer", transition:"background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#ef444415"}
                onMouseLeave={e => e.currentTarget.style.background="#ef444408"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{n.title}</div>
                    <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.5 }}>
                      {n.content.slice(0, 100)}{n.content.length > 100 ? "..." : ""}
                    </div>
                  </div>
                  <span style={{ fontSize:10, color:"var(--text3)", whiteSpace:"nowrap", marginLeft:12 }}>
                    {new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All notices */}
      {loading ? (
        <p style={{ color:"var(--text3)", fontSize:13 }}>Loading notices...</p>
      ) : notices.length === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--text3)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:14 }}>No notices yet</div>
          {canPost && <div style={{ fontSize:12, marginTop:6 }}>Click "Post Notice" to add one</div>}
        </div>
      ) : (
        <>
          {rest.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {rest.map(n => (
                <div key={n._id} onClick={() => openNotice(n)} style={{
                  background:"var(--card)", border:"1px solid var(--border)",
                  borderLeft:`4px solid ${priorityColor[n.priority]}`,
                  borderRadius:10, padding:"14px 18px", cursor:"pointer",
                  transition:"border-color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=priorityColor[n.priority]}
                  onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:categoryColor[n.category]+"22", color:categoryColor[n.category] }}>
                          {categoryIcon[n.category]} {n.category}
                        </span>
                        {n.priority !== "normal" && (
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:priorityBg[n.priority], color:priorityColor[n.priority], textTransform:"uppercase" }}>
                            {n.priority}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{n.title}</div>
                      <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.5 }}>
                        {n.content.slice(0, 120)}{n.content.length > 120 ? "..." : ""}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                      </div>
                      <div style={{ fontSize:11, color:"var(--text3)" }}>👁 {n.views}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:8 }}>
                    by {n.postedBy?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}