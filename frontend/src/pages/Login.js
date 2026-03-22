import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const inputStyle = {
  width:"100%", padding:"11px 14px", background:"var(--bg3)", border:"1px solid var(--border)",
  borderRadius:8, color:"var(--text)", fontSize:14, outline:"none",
};

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:20 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo1.png" alt="NIELIT Logo" style={{ width:380, height:"auto", objectFit:"contain", margin:"0 auto 14px", display:"block", background:"#fff", padding:10, borderRadius:12 }} />
.
          <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.5px" }}>ByteNIELIT</h1>
          <p style={{ color:"var(--text2)", fontSize:14, marginTop:4 }}>Your campus, all in one place</p>
        </div>

        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:28 }}>
          <h2 style={{ fontSize:18, fontWeight:600, marginBottom:20 }}>Sign in</h2>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6 }}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@nielit.ac.in" value={form.email}
                onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6 }}>Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(p=>({...p,password:e.target.value}))} required />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop:6, padding:"12px", borderRadius:8, fontWeight:600, fontSize:14,
              background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff",
              opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed":"pointer",
            }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--text2)" }}>
            No account? <Link to="/register" style={{ color:"var(--accent)", fontWeight:500 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
