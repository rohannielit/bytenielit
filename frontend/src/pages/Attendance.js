import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const inp = { width:"100%", padding:"9px 12px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13, outline:"none" };

// College coordinates — update this to your NIELIT campus location
const COLLEGE_LAT = 28.6139;
const COLLEGE_LNG = 77.2090;
const ALLOWED_RADIUS_METERS = 300;

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function Attendance() {
  const { user } = useAuth();
  const [data, setData] = useState({ records:[], summary:{} });
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState(null); // null | "checking" | "inside" | "outside" | "denied"
  const [geoDistance, setGeoDistance] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSubject, setCheckInSubject] = useState("");

  useEffect(() => {
    api.get("/attendance/my").then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const checkLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported by your browser");
    setGeoStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistanceMeters(pos.coords.latitude, pos.coords.longitude, COLLEGE_LAT, COLLEGE_LNG);
        setGeoDistance(Math.round(dist));
        setGeoStatus(dist <= ALLOWED_RADIUS_METERS ? "inside" : "outside");
      },
      () => {
        setGeoStatus("denied");
        toast.error("Location access denied. Please enable in browser settings.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitGeoAttendance = async () => {
    if (!checkInSubject) return toast.error("Enter the subject name");
    if (geoStatus !== "inside") return toast.error("You must be on campus to check in");
    setCheckingIn(true);
    try {
      await api.post("/attendance/mark", {
        records: [{ studentId: user.id, status: "present" }],
        subject: checkInSubject,
        semester: user.semester,
        branch: user.branch,
        date: new Date().toISOString(),
      });
      toast.success("Checked in successfully!");
      // Refresh
      const r = await api.get("/attendance/my");
      setData(r.data);
    } catch {
      toast.error("Check-in failed");
    } finally { setCheckingIn(false); }
  };

  const subjects = Object.entries(data.summary || {}).map(([subject, s]) => ({
    subject, total: s.total, present: s.present,
    pct: s.total > 0 ? Math.round((s.present/s.total)*100) : 0,
  }));

  const getColor = (pct) => pct >= 75 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  const geoColors = { inside:"#10b981", outside:"#ef4444", denied:"#f59e0b", checking:"#3b82f6" };
  const geoLabels = { inside:"On campus — you can check in!", outside:`Too far — ${geoDistance}m from campus (max ${ALLOWED_RADIUS_METERS}m)`, denied:"Location access denied", checking:"Checking your location..." };

  return (
    <div style={{ padding:24, maxWidth:900, margin:"0 auto" }} className="fade-in">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Attendance</h1>
        <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>Your attendance records + location check-in</p>
      </div>

      {/* Location Check-In Card */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:24 }}>
        <h2 style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Location-based Check-in</h2>
        <p style={{ fontSize:12, color:"var(--text3)", marginBottom:16 }}>
          Must be within {ALLOWED_RADIUS_METERS}m of campus to mark yourself present
        </p>

        {geoStatus && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:8, background:`${geoColors[geoStatus]}11`, border:`1px solid ${geoColors[geoStatus]}33`, marginBottom:14 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:geoColors[geoStatus], flexShrink:0 }} />
            <span style={{ fontSize:13, color:geoColors[geoStatus], fontWeight:500 }}>{geoLabels[geoStatus]}</span>
          </div>
        )}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div style={{ flex:1, minWidth:180 }}>
            <label style={{ fontSize:11, color:"var(--text2)", display:"block", marginBottom:4 }}>Subject</label>
            <input style={inp} placeholder="e.g. Data Structures" value={checkInSubject} onChange={e=>setCheckInSubject(e.target.value)} />
          </div>
          <button onClick={checkLocation} style={{ padding:"9px 16px", borderRadius:8, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", fontSize:13, fontWeight:500, cursor:"pointer" }}>
            {geoStatus === "checking" ? "Locating..." : "Check Location"}
          </button>
          <button onClick={submitGeoAttendance} disabled={geoStatus !== "inside" || checkingIn || !checkInSubject} style={{
            padding:"9px 16px", borderRadius:8, border:"none",
            background: geoStatus==="inside" && checkInSubject ? "linear-gradient(135deg,#10b981,#3b82f6)":"var(--bg3)",
            color: geoStatus==="inside" && checkInSubject ? "#fff":"var(--text3)",
            fontSize:13, fontWeight:600, cursor: geoStatus==="inside" && checkInSubject ? "pointer":"not-allowed",
            opacity: checkingIn ? 0.7 : 1,
          }}>
            {checkingIn ? "Checking in..." : "Check In"}
          </button>
        </div>

        <p style={{ fontSize:11, color:"var(--text3)", marginTop:10 }}>
          Campus coordinates: {COLLEGE_LAT}, {COLLEGE_LNG} — update in <code style={{ background:"var(--bg3)", padding:"1px 4px", borderRadius:3 }}>Attendance.js</code> line 14–15
        </p>
      </div>

      {loading ? <p style={{ color:"var(--text3)" }}>Loading...</p> : (
        <>
          {subjects.length > 0 ? (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:24 }}>
                {subjects.map(s=>(
                  <div key={s.subject} style={{ background:"var(--card)", border:`1px solid ${getColor(s.pct)}44`, borderRadius:12, padding:16, borderTop:`3px solid ${getColor(s.pct)}` }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>{s.subject}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:getColor(s.pct) }}>{s.pct}%</div>
                    <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{s.present}/{s.total} classes</div>
                    {s.pct < 75 && (
                      <div style={{ fontSize:10, color:"#ef4444", marginTop:6, background:"#ef444411", padding:"3px 8px", borderRadius:10 }}>
                        ⚠ Below 75% — need {Math.ceil((0.75*s.total - s.present)/0.25)} more
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:24 }}>
                <h2 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Attendance Overview</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subjects} margin={{ top:0, right:10, left:-20, bottom:0 }}>
                    <XAxis dataKey="subject" tick={{ fill:"#64748b", fontSize:12 }} />
                    <YAxis domain={[0,100]} tick={{ fill:"#64748b", fontSize:12 }} />
                    <Tooltip contentStyle={{ background:"#1a2235", border:"1px solid #1e2d45", borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`,"Attendance"]} />
                    <Bar dataKey="pct" radius={[6,6,0,0]}>
                      {subjects.map((s,i)=><Cell key={i} fill={getColor(s.pct)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:40, color:"var(--text3)" }}>
              No attendance records yet. Use the check-in above or ask your teacher to mark attendance.
            </div>
          )}

          {data.records.length > 0 && (
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:14 }}>Recent Records</div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)" }}>
                    {["Subject","Date","Status"].map(h=><th key={h} style={{ padding:"10px 16px", textAlign:"left", color:"var(--text3)", fontWeight:500, fontSize:12 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.records.slice(0,20).map(r=>(
                    <tr key={r._id} style={{ borderBottom:"1px solid var(--border)" }}>
                      <td style={{ padding:"10px 16px" }}>{r.subject}</td>
                      <td style={{ padding:"10px 16px", color:"var(--text2)" }}>{new Date(r.date).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <span style={{ fontSize:11, padding:"2px 10px", borderRadius:10,
                          background: r.status==="present"?"#10b98122":r.status==="late"?"#f59e0b22":"#ef444422",
                          color: r.status==="present"?"#10b981":r.status==="late"?"#f59e0b":"#ef4444"
                        }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
