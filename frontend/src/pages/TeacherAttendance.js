import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const inp = {
  width: "100%", padding: "9px 12px", background: "var(--bg3)",
  border: "1px solid var(--border)", borderRadius: 8,
  color: "var(--text)", fontSize: 13, outline: "none",
};

const statusColor = { present: "#10b981", absent: "#ef4444", late: "#f59e0b" };

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { studentId: "present"|"absent"|"late" }
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState(user?.semester || 1);
  const [branch, setBranch] = useState(user?.branch || "CSE");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("mark"); // "mark" | "history"

  useEffect(() => {
    api.get("/users")
      .then(r => {
        const s = r.data.filter(u => u.role === "student" &&
          (!branch || u.branch === branch) &&
          (!semester || u.semester == semester));
        setStudents(s);
        const init = {};
        s.forEach(st => init[st._id] = "present");
        setRecords(init);
      })
      .catch(() => toast.error("Failed to load students"));
  }, [branch, semester]);

  useEffect(() => {
    if (tab === "history") {
      api.get(`/attendance/all?subject=${subject}&semester=${semester}`)
        .then(r => setHistory(r.data))
        .catch(() => {});
    }
  }, [tab, subject, semester]);

  const toggle = (id) => {
    setRecords(p => ({
      ...p,
      [id]: p[id] === "present" ? "absent" : p[id] === "absent" ? "late" : "present",
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => updated[s._id] = status);
    setRecords(updated);
  };

  const submit = async () => {
    if (!subject) return toast.error("Enter subject name first");
    setSaving(true);
    try {
      const recordsArr = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
      await api.post("/attendance/mark", {
        records: recordsArr,
        subject, semester, branch, date,
      });
      toast.success(`Attendance marked for ${recordsArr.length} students!`);
    } catch {
      toast.error("Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  const present = Object.values(records).filter(v => v === "present").length;
  const absent = Object.values(records).filter(v => v === "absent").length;
  const late = Object.values(records).filter(v => v === "late").length;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }} className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Teacher — Mark Attendance</h1>
        <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 3 }}>
          Mark and review student attendance
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg3)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {["mark", "history"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 20px", borderRadius: 8, border: "none", fontWeight: 500, fontSize: 13,
            background: tab === t ? "var(--card)" : "transparent",
            color: tab === t ? "var(--text)" : "var(--text2)", cursor: "pointer",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
          }}>
            {t === "mark" ? "Mark Attendance" : "View History"}
          </button>
        ))}
      </div>

      {tab === "mark" && (
        <>
          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 4 }}>Subject *</label>
              <input style={inp} placeholder="e.g. Data Structures" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 4 }}>Branch</label>
              <select style={inp} value={branch} onChange={e => setBranch(e.target.value)}>
                {["BCA","O Level","A Level","CHE-T O-Level","PMKVY","CCC"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 4 }}>Semester</label>
              <select style={inp} value={semester} onChange={e => setSemester(+e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 4 }}>Date</label>
              <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {/* Stats + bulk actions */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            {[["Present", present, "#10b981"], ["Absent", absent, "#ef4444"], ["Late", late, "#f59e0b"]].map(([lbl, val, color]) => (
              <div key={lbl} style={{ background: "var(--card)", border: `1px solid ${color}44`, borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{lbl}</div>
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {["present", "absent", "late"].map(s => (
                <button key={s} onClick={() => markAll(s)} style={{
                  padding: "7px 14px", borderRadius: 8, border: `1px solid ${statusColor[s]}44`,
                  background: `${statusColor[s]}11`, color: statusColor[s],
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>All {s}</button>
              ))}
            </div>
          </div>

          {/* Student list */}
          {students.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>
              No students found for {branch} Sem {semester}
            </div>
          ) : (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              {students.map((st, i) => (
                <div key={st._id} onClick={() => toggle(st._id)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 18px",
                  borderBottom: i < students.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer", transition: "background 0.1s",
                  background: records[st._id] === "absent" ? "#ef444408" : records[st._id] === "late" ? "#f59e0b08" : "transparent",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: `${statusColor[records[st._id] || "present"]}22`,
                    border: `2px solid ${statusColor[records[st._id] || "present"]}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, color: statusColor[records[st._id] || "present"],
                    flexShrink: 0,
                  }}>
                    {st.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{st.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>
                      {st.rollNumber || "No roll no."} · {st.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["present", "absent", "late"].map(s => (
                      <button key={s} onClick={(e) => { e.stopPropagation(); setRecords(p => ({ ...p, [st._id]: s })); }} style={{
                        padding: "4px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer",
                        background: records[st._id] === s ? statusColor[s] : `${statusColor[s]}18`,
                        color: records[st._id] === s ? "#fff" : statusColor[s],
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={submit} disabled={saving || !subject} style={{
            width: "100%", padding: "13px", borderRadius: 10,
            background: subject ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "var(--bg3)",
            border: "none", color: subject ? "#fff" : "var(--text3)",
            fontWeight: 700, fontSize: 15, cursor: subject ? "pointer" : "not-allowed",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving..." : `Submit Attendance (${students.length} students)`}
          </button>
        </>
      )}

      {tab === "history" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input style={{ ...inp, maxWidth: 220 }} placeholder="Filter by subject..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text3)" }}>No records found</div>
          ) : (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Student", "Roll No", "Subject", "Date", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "var(--text3)", fontWeight: 500, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 50).map(r => (
                    <tr key={r._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 500 }}>{r.student?.name}</td>
                      <td style={{ padding: "10px 16px", color: "var(--text2)" }}>{r.student?.rollNumber || "—"}</td>
                      <td style={{ padding: "10px 16px" }}>{r.subject}</td>
                      <td style={{ padding: "10px 16px", color: "var(--text2)" }}>{new Date(r.date).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          fontSize: 11, padding: "2px 10px", borderRadius: 10,
                          background: `${statusColor[r.status]}22`, color: statusColor[r.status],
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
