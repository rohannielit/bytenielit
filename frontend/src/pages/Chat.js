import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const ROOMS = [
  { id:"general",    label:"General" },
  { id:"bca",        label:"BCA" },
  { id:"olevel",     label:"O Level" },
  { id:"alevel",     label:"A Level" },
  { id:"chet",       label:"CHE-T O-Level" },
  { id:"pmkvy",      label:"PMKVY" },
  { id:"ccc",        label:"CCC" },
  { id:"faculty",    label:"Faculty" },
];
const roleColor = { admin:"#ef4444", teacher:"#f59e0b", student:"#3b82f6" };

export default function Chat() {
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const bottomRef = useRef();
  const typingTimer = useRef();

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setSummary(null);
    setShowSummary(false);
    api.get(`/chat/${room}`).then(r => setMessages(r.data)).catch(() => {}).finally(() => setLoading(false));
    if (socket) socket.emit("joinRoom", room);
  }, [room, socket]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => { if (msg.room === room) setMessages(p => [...p, msg]); };
    const onTyping = ({ name: n, isTyping }) => setTyping(p => isTyping ? [...p.filter(x=>x!==n), n] : p.filter(x=>x!==n));
    socket.on("newMessage", onMsg);
    socket.on("userTyping", onTyping);
    return () => { socket.off("newMessage", onMsg); socket.off("userTyping", onTyping); };
  }, [socket, room]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const content = text.trim();
    if (!content || !socket) return;
    socket.emit("sendMessage", { content, room });
    setText("");
    socket.emit("typing", { room, isTyping: false });
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { room, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("typing", { room, isTyping: false }), 1500);
  };

  const generateSummary = async () => {
    setSummarizing(true);
    setShowSummary(true);
    try {
      const { data } = await api.post("/ai/summarize", { room, limit: 50 });
      setSummary(data);
      toast.success("Summary generated!");
    } catch {
      toast.error("Failed. Add ANTHROPIC_API_KEY to .env");
      setShowSummary(false);
    } finally { setSummarizing(false); }
  };

  const isMe = (msg) => msg.sender?._id === user?.id || msg.sender === user?.id;
  const fmtTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const inpStyle = { flex:1, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:14, outline:"none", resize:"none", maxHeight:100, lineHeight:1.4 };

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      {/* Room sidebar */}
      <div style={{ width:180, background:"var(--card)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"16px 14px 10px", fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Channels</div>
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => setRoom(r.id)} style={{
            display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
            background: room===r.id ? "var(--bg3)":"none", border:"none",
            color: room===r.id ? "var(--text)":"var(--text2)", fontSize:13, fontWeight: room===r.id?600:400,
            textAlign:"left", cursor:"pointer", borderLeft: room===r.id?"2px solid var(--accent)":"2px solid transparent",
          }}>
            <span style={{ fontSize:12, color:"var(--text3)" }}>#</span> {r.label}
          </button>
        ))}
        <div style={{ padding:"14px", borderTop:"1px solid var(--border)", marginTop:"auto" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Online ({onlineUsers.length})</div>
          {onlineUsers.slice(0,8).map((u,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 0", fontSize:12 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", flexShrink:0 }} />
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16, color:"var(--text3)" }}>#</span>
          <span style={{ fontWeight:600, fontSize:15 }}>{ROOMS.find(r=>r.id===room)?.label}</span>
          <span style={{ fontSize:12, color:"var(--text3)", marginLeft:4 }}>{messages.length} msgs</span>
          <div style={{ marginLeft:"auto" }}>
            <button onClick={generateSummary} disabled={summarizing || messages.length===0} style={{
              padding:"6px 14px", borderRadius:8, border:"1px solid #8b5cf644",
              background: "#8b5cf611", color:"#8b5cf6", fontSize:12, fontWeight:500,
              cursor: messages.length>0 ? "pointer":"not-allowed", opacity: messages.length===0?0.5:1,
            }}>
              {summarizing ? "Summarizing..." : "AI Summary"}
            </button>
          </div>
        </div>

        {/* AI Summary panel */}
        {showSummary && (
          <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--border)", background:"#8b5cf611" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#8b5cf6" }}>AI Chat Summary</span>
              <button onClick={()=>setShowSummary(false)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
            </div>
            {summarizing ? (
              <p style={{ fontSize:12, color:"var(--text2)", fontStyle:"italic" }}>Analyzing {messages.length} messages...</p>
            ) : summary ? (
              <>
                <p style={{ fontSize:13, color:"var(--text)", lineHeight:1.6 }}>{summary.summary}</p>
                <p style={{ fontSize:11, color:"var(--text3)", marginTop:6 }}>Based on last {summary.messageCount} messages</p>
              </>
            ) : null}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex:1, overflow:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:2 }}>
          {loading && <div style={{ textAlign:"center", color:"var(--text3)", fontSize:13, marginTop:20 }}>Loading messages...</div>}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign:"center", color:"var(--text3)", fontSize:13, marginTop:40 }}>No messages yet. Say hi!</div>
          )}
          {messages.map((msg, i) => {
            const me = isMe(msg);
            const showName = !me && (i===0 || messages[i-1]?.sender?._id !== msg.sender?._id);
            return (
              <div key={msg._id||i} style={{ display:"flex", flexDirection:"column", alignItems: me?"flex-end":"flex-start", marginTop: showName ? 12 : 2 }}>
                {showName && (
                  <div style={{ fontSize:11, fontWeight:600, color: roleColor[msg.sender?.role]||"var(--text2)", marginBottom:3, marginLeft:4 }}>
                    {msg.sender?.name} <span style={{ fontWeight:400, color:"var(--text3)" }}>({msg.sender?.role})</span>
                  </div>
                )}
                <div style={{ display:"flex", alignItems:"flex-end", gap:6, flexDirection: me?"row-reverse":"row" }}>
                  <div style={{
                    maxWidth:"70%", padding:"8px 13px",
                    borderRadius: me?"14px 14px 4px 14px":"14px 14px 14px 4px",
                    background: me?"linear-gradient(135deg,#3b82f6,#6366f1)":"var(--bg3)",
                    color: me?"#fff":"var(--text)", fontSize:13, lineHeight:1.5, wordBreak:"break-word",
                  }}>{msg.content}</div>
                  <span style={{ fontSize:10, color:"var(--text3)", whiteSpace:"nowrap" }}>{fmtTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}
          {typing.length > 0 && (
            <div style={{ fontSize:11, color:"var(--text3)", fontStyle:"italic", marginTop:6 }}>
              {typing.join(", ")} {typing.length===1?"is":"are"} typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea style={inpStyle} rows={1} placeholder={`Message #${ROOMS.find(r=>r.id===room)?.label}...`}
            value={text} onChange={handleTyping} onKeyDown={handleKeyDown} />
          <button onClick={send} disabled={!text.trim()} style={{
            padding:"10px 18px", borderRadius:10,
            background: text.trim()?"linear-gradient(135deg,#3b82f6,#6366f1)":"var(--bg3)",
            border:"none", color: text.trim()?"#fff":"var(--text3)",
            fontWeight:600, fontSize:13, cursor: text.trim()?"pointer":"default", transition:"all 0.15s",
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}
