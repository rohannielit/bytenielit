import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const inp = { width:"100%", padding:"11px 14px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:14, outline:"none" };
const sel = { ...inp, appearance:"none" };

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"student", rollNumber:"", branch:"", semester:1 });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:20 }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, margin:"0 auto 12px" }}>B</div>
          <h1 style={{ fontSize:22, fontWeight:700 }}>Join ByteNIELIT</h1>
        </div>
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:28 }}>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {[["Full Name","name","text"],["Email","email","email"],["Password","password","password"],["Roll Number","rollNumber","text"]].map(([lbl,key,type])=>(
              <div key={key}>
                <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:5 }}>{lbl}</label>
                <input style={inp} type={type} value={form[key]} onChange={set(key)} required={key!=="rollNumber"} placeholder={key==="email"?"you@nielit.ac.in":""} />
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:5 }}>Role</label>
                <select style={sel} value={form.role} onChange={set("role")}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:5 }}>Semester</label>
                <select style={sel} value={form.semester} onChange={set("semester")}>
                  {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:5 }}>Branch</label>
              <select style={sel} value={form.branch} onChange={set("branch")}>
                <option value="">Select Branch</option>
                {["BCA","O Level","A Level","CHE-T O-Level","PMKVY","CCC"].map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop:4, padding:"12px", borderRadius:8, fontWeight:600, fontSize:14, background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff", opacity:loading?0.7:1, cursor:loading?"not-allowed":"pointer" }}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:"var(--text2)" }}>
            Already registered? <Link to="/login" style={{ color:"var(--accent)", fontWeight:500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
