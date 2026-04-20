import { memo } from "react"

const hms = d => d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

export const AgentPanel = memo(({
  messages,
  processing,
  pending,
  input,
  setInput,
  micState,
  interim,
  startListen,
  stopListen,
  textareaRef,
  handleKey,
  send,
  confirm,
  reject,
  setShowMobileAgent,
  bottom,
  micC,
}) => {
  return (
    <>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-7.5-1.5 1.5m-10 10-1.5 1.5m0-13 1.5 1.5m10 10 1.5 1.5" /></svg>
        <div><div style={{ fontWeight: 700, fontSize: 12, color: "#0F172A" }}>Agente ARIA</div><div style={{ fontSize: 9, color: "#94A3B8" }}>Groq · Llama 3.3 70B · Contexto activo</div></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 9 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "92%", animation: "fadeUp .2s ease" }}>
            <div style={{
              padding: "8px 11px", borderRadius: 11, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, lineHeight: 1.7, whiteSpace: "pre-wrap",
              ...(m.role === "user" ? { background: "linear-gradient(135deg,#2563EB,#7C3AED)", color: "#fff", borderBottomRightRadius: 3 } : { background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#334155", borderBottomLeftRadius: 3 })
            }}>
              {m.text}
              {m.updateData && pending && <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button onClick={() => { confirm(); setShowMobileAgent(false); }} style={{ padding: "5px 13px", background: "linear-gradient(135deg,#2563EB,#7C3AED)", color: "#fff", border: "none", borderRadius: 7, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>✓ Confirmar</button>
                <button onClick={reject} style={{ padding: "5px 11px", background: "#fff", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: 7, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, cursor: "pointer" }}>Descartar</button>
              </div>}
            </div>
            <div style={{ fontSize: 8.5, color: "#CBD5E1", marginTop: 2, padding: "0 2px", textAlign: m.role === "user" ? "right" : "left" }}>{hms(m.ts)}</div>
          </div>
        ))}
        {processing && <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 11, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#94A3B8", alignSelf: "flex-start" }}>
          {[0, .15, .3].map((d, i) => <span key={i} style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "#3B82F6", animation: `bounce 1s ${d}s infinite` }} />)}
          <span style={{ marginLeft: 3 }}>Procesando...</span>
        </div>}
        <div ref={bottom} />
      </div>
      {/* Input */}
      <div style={{ padding: "8px 10px 10px", borderTop: "1px solid #F1F5F9", background: "#fff" }}>
        {micState !== "idle" && <div style={{ marginBottom: 7, padding: "5px 9px", borderRadius: 6, background: micState === "listening" ? "#EFF6FF" : "#FEF2F2", border: micState === "listening" ? "1px solid #BFDBFE" : "1px solid #FECACA", fontSize: 10, color: micState === "listening" ? "#1D4ED8" : "#B91C1C", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
          {micState === "listening" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563EB", display: "inline-block", animation: "pulse 1s infinite", flexShrink: 0 }} />}
          <span>{micState === "listening" ? (interim ? `🎙 "${interim}"` : "🎙 Escuchando...") : micState === "requesting" ? "Solicitando permiso..." : "Error — revisá permisos"}</span>
        </div>}
        {pending && <div style={{ marginBottom: 7, padding: "5px 9px", background: "#FFF7ED", border: "1px solid #FDE68A", borderRadius: 6, fontSize: 10, color: "#92400E", fontWeight: 500 }}>
          💬 Pendiente de confirmación — respondé "dale" para confirmar o "no" para descartar
        </div>}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          <button onClick={micState === "listening" ? stopListen : startListen} disabled={micState === "requesting"}
            style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, border: "1.5px solid " + micC.border, background: micC.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: micC.anim, transition: "all .2s" }}>
            {micState === "listening" ? <svg width="12" height="12" viewBox="0 0 24 24" fill={micC.icon} stroke="none"><rect x="4" y="4" width="16" height="16" rx="2" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={micC.icon} strokeWidth="2"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>}
          </button>
          <textarea
            ref={textareaRef}
            style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 9, padding: "8px 11px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12.5, color: "#0F172A", resize: "none", minHeight: 36, maxHeight: 120, lineHeight: 1.55, overflowY: "auto", transition: "border-color .2s" }}
            placeholder='Escribí o dictá una actualización...'
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}
            onFocus={e => e.target.style.borderColor = "#93C5FD"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
          <button onClick={send} disabled={processing || !input.trim()}
            style={{ width: 36, height: 36, borderRadius: 8, border: "none", flexShrink: 0, background: processing || !input.trim() ? "#E2E8F0" : "linear-gradient(135deg,#2563EB,#7C3AED)", cursor: processing || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity .2s" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </>
  )
})

AgentPanel.displayName = "AgentPanel"
