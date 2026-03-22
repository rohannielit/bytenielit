import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const inp = {
  width:"100%", padding:"10px 14px", background:"var(--bg3)",
  border:"1px solid var(--border)", borderRadius:8,
  color:"var(--text)", fontSize:14, outline:"none",
};
const roleColor = { admin:"#ef4444", teacher:"#f59e0b", student:"#10b981" };
const roleBg = { admin:"#ef444422", teacher:"#f59e0b22", student:"#10b98122" };

export default function Profile() {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [changingPw, setChangingPw] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get("/profile")
      .then(r => {
        setProfile(r.data.user);
        setStats(r.data.stats);
        setForm({
          name: r.data.user.name || "",
          rollNumber: r.data.user.rollNumber || "",
          branch: r.data.user.branch || "",
          semester: r.data.user.semester || "",
          phone: r.data.user.phone || "",
          bio: r.data.user.bio || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile", form);
      setProfile(data);
      // Update form with saved data
      setForm({
        name: data.name || "",
        rollNumber: data.rollNumber || "",
        branch: data.branch || "",
        semester: data.semester || "",
        phone: data.phone || "",
        bio: data.bio || "",
      });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile save error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
    finally { setSaving(false); }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Photo must be under 5MB");
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const { data } = await api.post("/profile/photo", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(p => ({ ...p, avatar: data.avatar }));
      toast.success("Photo updated!");
    } catch { toast.error("Failed to upload photo"); }
    finally { setUploadingPhoto(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error("Fill in all fields");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("New passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setChangingPw(true);
    try {
      await api.put("/profile/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setChangingPw(false); }
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--text3)" }}>
      Loading profile...
    </div>
  );

  const initials = profile?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);

  return (
    <div style={{ padding:24, maxWidth:800, margin:"0 auto" }} className="fade-in">

      {/* Profile Header Card */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:28, marginBottom:20, position:"relative", overflow:"hidden" }}>
        {/* Background decoration */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:90, background:"linear-gradient(135deg,#3b82f620,#8b5cf620)", borderRadius:"16px 16px 0 0" }} />

        <div style={{ position:"relative", display:"flex", gap:20, alignItems:"flex-end", flexWrap:"wrap" }}>
          {/* Avatar */}
          <div style={{ position:"relative" }}>
            <div style={{
              width:88, height:88, borderRadius:"50%",
              background: profile?.avatar ? "transparent" : `linear-gradient(135deg,#3b82f6,#8b5cf6)`,
              border:"3px solid var(--card)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28, fontWeight:700, color:"#fff",
              overflow:"hidden", flexShrink:0,
            }}>
              {profile?.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : initials
              }
            </div>
            {/* Upload button */}
            <button onClick={() => fileRef.current?.click()} style={{
              position:"absolute", bottom:0, right:0,
              width:26, height:26, borderRadius:"50%",
              background:"linear-gradient(135deg,#3b82f6,#6366f1)",
              border:"2px solid var(--card)", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, color:"#fff",
            }} title="Upload photo">
              {uploadingPhoto ? "..." : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display:"none" }} />
          </div>

          {/* Name + role */}
          <div style={{ flex:1, minWidth:200 }}>
            <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>{profile?.name}</h1>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:600, padding:"3px 12px", borderRadius:20, background:roleBg[profile?.role], color:roleColor[profile?.role], textTransform:"capitalize" }}>
                {profile?.role}
              </span>
              {profile?.branch && (
                <span style={{ fontSize:12, color:"var(--text2)", background:"var(--bg3)", padding:"3px 10px", borderRadius:20 }}>
                  {profile.branch}
                </span>
              )}
              {profile?.semester && (
                <span style={{ fontSize:12, color:"var(--text2)", background:"var(--bg3)", padding:"3px 10px", borderRadius:20 }}>
                  Sem {profile.semester}
                </span>
              )}
            </div>
            {profile?.bio && (
              <p style={{ fontSize:13, color:"var(--text2)", marginTop:8, lineHeight:1.5 }}>{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:12, marginTop:24, paddingTop:20, borderTop:"1px solid var(--border)" }}>
            {[
              { label:"Attendance", value:`${stats.attendancePct}%`, color: stats.attendancePct>=75?"#10b981":stats.attendancePct>=60?"#f59e0b":"#ef4444" },
              { label:"Classes attended", value:`${stats.presentClasses}/${stats.totalClasses}`, color:"#3b82f6" },
              { label:"Notes uploaded", value:stats.notesUploaded, color:"#8b5cf6" },
              { label:"Complaints raised", value:stats.complaintsRaised, color:"#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"var(--bg3)", padding:4, borderRadius:10, width:"fit-content" }}>
        {["profile","security"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"7px 20px", borderRadius:8, border:"none", fontWeight:500, fontSize:13,
            background: tab===t ? "var(--card)":"transparent",
            color: tab===t ? "var(--text)":"var(--text2)", cursor:"pointer",
            boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,0.3)":"none",
            textTransform:"capitalize",
          }}>{t === "profile" ? "Edit Profile" : "Change Password"}</button>
        ))}
      </div>

      {/* Edit Profile Tab */}
      {tab === "profile" && (
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h2 style={{ fontSize:15, fontWeight:600 }}>Personal Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{
                padding:"7px 16px", borderRadius:8, background:"var(--bg3)",
                border:"1px solid var(--border)", color:"var(--text)",
                fontSize:13, fontWeight:500, cursor:"pointer",
              }}>Edit</button>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              ["Full Name","name","text"],
              ["Email","email","email"],
              ["Roll Number","rollNumber","text"],
              ["Phone","phone","tel"],
            ].map(([lbl,key,type]) => (
              <div key={key}>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>{lbl}</label>
                {editing && key !== "email" ? (
                  <input style={inp} type={type} value={form[key]||""} onChange={e => setForm(p=>({...p,[key]:e.target.value}))} />
                ) : (
                  <div style={{ padding:"10px 14px", background:"var(--bg3)", borderRadius:8, fontSize:14, color: key==="email"?"var(--text2)":"var(--text)" }}>
                    {key === "email" ? profile?.email : (form[key] || <span style={{ color:"var(--text3)" }}>Not set</span>)}
                  </div>
                )}
              </div>
            ))}

            <div>
              <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Branch</label>
              {editing ? (
                <select style={inp} value={form.branch||""} onChange={e => setForm(p=>({...p,branch:e.target.value}))}>
                  <option value="">Select Branch</option>
                  {["BCA","O Level","A Level","CHE-T O-Level","PMKVY","CCC"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <div style={{ padding:"10px 14px", background:"var(--bg3)", borderRadius:8, fontSize:14 }}>
                  {form.branch || <span style={{ color:"var(--text3)" }}>Not set</span>}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Semester</label>
              {editing ? (
                <select style={inp} value={form.semester||""} onChange={e => setForm(p=>({...p,semester:e.target.value}))}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              ) : (
                <div style={{ padding:"10px 14px", background:"var(--bg3)", borderRadius:8, fontSize:14 }}>
                  {form.semester ? `Semester ${form.semester}` : <span style={{ color:"var(--text3)" }}>Not set</span>}
                </div>
              )}
            </div>

            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>Bio</label>
              {editing ? (
                <textarea style={{ ...inp, minHeight:80, resize:"vertical", lineHeight:1.6 }}
                  placeholder="Tell something about yourself..."
                  value={form.bio||""} onChange={e => setForm(p=>({...p,bio:e.target.value}))} />
              ) : (
                <div style={{ padding:"10px 14px", background:"var(--bg3)", borderRadius:8, fontSize:14, minHeight:60, lineHeight:1.6 }}>
                  {form.bio || <span style={{ color:"var(--text3)" }}>No bio yet</span>}
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={() => setEditing(false)} style={{
                flex:1, padding:"11px", borderRadius:8,
                background:"var(--bg3)", border:"1px solid var(--border)",
                color:"var(--text)", cursor:"pointer", fontWeight:500,
              }}>Cancel</button>
              <button onClick={saveProfile} disabled={saving} style={{
                flex:1, padding:"11px", borderRadius:8,
                background:"linear-gradient(135deg,#3b82f6,#6366f1)",
                border:"none", color:"#fff", fontWeight:600, cursor:"pointer",
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Change Password Tab */}
      {tab === "security" && (
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24, maxWidth:420 }}>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>Change Password</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              ["Current Password","currentPassword"],
              ["New Password","newPassword"],
              ["Confirm New Password","confirmPassword"],
            ].map(([lbl,key]) => (
              <div key={key}>
                <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:5 }}>{lbl}</label>
                <input style={inp} type="password" value={pwForm[key]}
                  onChange={e => setPwForm(p=>({...p,[key]:e.target.value}))}
                  placeholder="••••••••" />
              </div>
            ))}

            {pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
              <p style={{ fontSize:12, color:"#ef4444", marginTop:-8 }}>Passwords don't match</p>
            )}

            <button onClick={changePassword} disabled={changingPw} style={{
              marginTop:4, padding:"12px", borderRadius:8,
              background:"linear-gradient(135deg,#ef4444,#f59e0b)",
              border:"none", color:"#fff", fontWeight:600, fontSize:14,
              cursor:"pointer", opacity: changingPw ? 0.7 : 1,
            }}>
              {changingPw ? "Changing..." : "Change Password"}
            </button>
          </div>

          <div style={{ marginTop:20, padding:14, background:"var(--bg3)", borderRadius:8, fontSize:12, color:"var(--text3)", lineHeight:1.7 }}>
            Password must be at least 6 characters long. After changing, you'll need to login again next time.
          </div>
        </div>
      )}
    </div>
  );
}