import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const roleColor = { admin:"#ef4444", teacher:"#f59e0b", student:"#10b981" };

export default function Layout() {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const nav = [
    { to:"/",           label:"Dashboard",         icon:"⊞", roles:["student","teacher","admin"], end:true },
    { to:"/timetable",  label:"Timetable",          icon:"◫", roles:["student","teacher","admin"] },
    { to:"/notes",      label:"Notes",              icon:"◧", roles:["student","teacher","admin"] },
    { to:"/events",     label:"Events",             icon:"◈", roles:["student","teacher","admin"] },
    { to:"/complaints", label:"Complaints",         icon:"⚑", roles:["student","teacher","admin"] },
    { to:"/chat",       label:"Chat",               icon:"◉", roles:["student","teacher","admin"] },
    { to:"/attendance", label:"Attendance",         icon:"▦", roles:["student","teacher","admin"] },
    { to:"/notices",    label:"Notice Board",        icon:"📋", roles:["student","teacher","admin"] },
    { to:"/profile",   label:"My Profile",          icon:"👤", roles:["student","teacher","admin"] },
    { to:"/teacher/attendance", label:"Mark Attendance", icon:"✓", roles:["teacher","admin"] },
    { to:"/admin",      label:"Admin Panel",        icon:"⚙", roles:["admin"] },
  ].filter(n => n.roles.includes(user?.role));

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <aside style={{ width: collapsed ? 64 : 220, background:"var(--card)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", transition:"width 0.25s ease", flexShrink:0, overflow:"hidden" }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, flexShrink:0 }}>B</div>
          {!collapsed && <span style={{ fontWeight:700, fontSize:15, letterSpacing:"-0.3px", whiteSpace:"nowrap" }}>ByteNIELIT</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {nav.map(({ to, icon, label, end, roles }) => {
            const isTeacherOnly = roles?.length === 2 && roles.includes("teacher") && roles.includes("admin") && !roles.includes("student");
            const isAdminOnly = roles?.length === 1 && roles.includes("admin");
            return (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                borderRadius:8, fontSize:14, fontWeight: isActive?600:400,
                color: isActive ? "#fff" : isAdminOnly ? "#ef444499" : isTeacherOnly ? "#f59e0b99" : "var(--text2)",
                background: isActive ? "linear-gradient(135deg,#3b82f620,#8b5cf620)":"transparent",
                borderLeft: isActive ? "2px solid #3b82f6":"2px solid transparent",
                transition:"all 0.15s", whiteSpace:"nowrap",
              })}>
                <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                {!collapsed && label}
              </NavLink>
            );
          })}
        </nav>

        {!collapsed && (
          <div style={{ padding:"10px 16px", borderTop:"1px solid var(--border)", fontSize:12, color:"var(--text3)" }}>
            <span style={{ color:"var(--green)" }}>●</span> {onlineUsers.length} online
          </div>
        )}

        {/* User info */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`${roleColor[user?.role]}33`, border:`2px solid ${roleColor[user?.role]}66`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:roleColor[user?.role], flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize:11, color:roleColor[user?.role], textTransform:"capitalize" }}>{user?.role}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout" style={{ background:"none", border:"none", color:"var(--text3)", fontSize:16, padding:4, borderRadius:6, cursor:"pointer" }}>⇥</button>
          )}
        </div>

        <button onClick={() => setCollapsed(p=>!p)} style={{ background:"none", border:"none", color:"var(--text3)", padding:"8px", fontSize:18, borderTop:"1px solid var(--border)", cursor:"pointer" }}>
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      <main style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        <Outlet />
      </main>
    </div>
  );
}