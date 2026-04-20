import { useState, useRef, useCallback, memo, useEffect } from "react"
import { Send, X, Sparkles, Loader } from "lucide-react"

const suggestions = [
  "¿Cuáles son mis prioridades hoy?",
  "Redactar seguimiento para Acme Corp",
  "Mostrar pipeline en riesgo",
  "Crear tarea de seguimiento",
]

// ── Build system prompt ───────────────────────────────────────────────────────
const buildSystemPrompt = (data) => {
  const {contacts = [], opportunities = [], contracts = [], tasks = []} = data || {}
  const contactsList = contacts.map(c => `[${c.id}] ${c.name} (${c.company})`).join(", ")
  const oppsList = opportunities.map(o => `[${o.id}] ${o.title} (${o.company}, ${o.stage})`).join(", ")
  const contractsList = contracts.map(c => `[${c.id}] ${c.title}`).join(", ")
  const tasksList = tasks.map(t => `[${t.id}] ${t.title}`).join(", ")
  
  return `Sos ARIA, asistente comercial inteligente para una empresa argentina de software/consultoría. Respondé siempre en español rioplatense informal pero profesional.

CONTACTOS: ${contactsList}
OPORTUNIDADES: ${oppsList}
CONTRATOS: ${contractsList}
TAREAS: ${tasksList}

Tu objetivo es interpretar intent natural y si corresponde, generar respuestas JSON con acción + datos.
Responde siempre en español. Si la solicitud es genérica o informativa, respondé conversacionalmente.
Si se trata de un cambio en datos (contacto, oportunidad, tarea, etc), devolvé JSON con \`action\` y \`updates\`.`;
}

// ── API call ─────────────────────────────────────────────────────────────────
async function callAgent(msg, data, history = []) {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: buildSystemPrompt(data),
      messages: [...history, { role: "user", content: msg }],
      max_tokens: 900,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  if (d.parsed) return d.parsed;
  return { action: "general", reply: d.text };
}

function ChatPanelComponent({ open, onOpenChange, contacts = [], opportunities = [], contracts = [], tasks = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "assistant",
      content: "¡Hola! Soy ARIA, tu asistente comercial. ¿Cómo puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [processing, setProcessing] = useState(false)
  const idRef = useRef(1)
  const messagesRef = useRef(messages)
  const dataRef = useRef({ contacts, opportunities, contracts, tasks })

  // Keep refs updated with latest values
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    dataRef.current = { contacts, opportunities, contracts, tasks }
  }, [contacts, opportunities, contracts, tasks])

  const handleSendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || processing) return

    // Add user message
    const userId = idRef.current++
    setMessages((prev) => [...prev, { id: userId, role: "user", content: text }])
    setInput("")
    setProcessing(true)

    try {
      const history = messagesRef.current
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }))

      const result = await callAgent(text, dataRef.current, history)
      const assistantId = idRef.current++
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: result.reply || result.summary || "Procesado.",
        },
      ])
    } catch (e) {
      const errorId = idRef.current++
      setMessages((prev) => [
        ...prev,
        {
          id: errorId,
          role: "assistant",
          content: `⚠️ Error: ${e.message}`,
        },
      ])
    } finally {
      setProcessing(false)
    }
  }, [input, processing])

  const handleSuggestion = (suggestion) => {
    setInput(suggestion)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => onOpenChange(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 49,
            animation: "fadeIn 200ms",
          }}
        />
      )}

      {/* Chat panel */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "384px",
          background: "#fff",
          borderLeft: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: open ? "-2px 0 16px rgba(0, 0, 0, 0.12)" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E2E8F0",
            padding: "16px",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
              ARIA Chat
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#0F172A"
              e.target.style.background = "#F1F5F9"
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#94A3B8"
              e.target.style.background = "transparent"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "#F8FAFC",
          }}
        >
          {messages.length === 1 && messages[0].role === "assistant" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
              }}
              >
                Sugerencias rápidas
              </p>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(suggestion)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: "11px",
                    fontSize: "13px",
                    color: "#0F172A",
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    cursor: "pointer",
                    transition: "all 150ms",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#F1F5F9"
                    e.target.style.borderColor = "#7C3AED"
                    e.target.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#fff"
                    e.target.style.borderColor = "#E2E8F0"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "slideUp 300ms ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "300px",
                    borderRadius: "18px",
                    padding: msg.role === "user" ? "10px 16px" : "12px 16px",
                    fontSize: "13.5px",
                    lineHeight: "1.5",
                    background: msg.role === "user" 
                      ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" 
                      : "#fff",
                    color: msg.role === "user" ? "#fff" : "#0F172A",
                    boxShadow: msg.role === "user"
                      ? "0 2px 8px rgba(124, 58, 237, 0.2)"
                      : "0 1px 3px rgba(0, 0, 0, 0.08)",
                    border: msg.role === "user" ? "none" : "1px solid #E2E8F0",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {processing && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                animation: "slideUp 300ms ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "18px",
                  padding: "12px 16px",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Loader size={14} color="#7C3AED" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "13px", color: "#94A3B8" }}>ARIA está pensando...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            padding: "14px 16px",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
            <input
              type="text"
              placeholder="Pregunta a ARIA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={processing}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                fontSize: "13px",
                outline: "none",
                color: "#0F172A",
                transition: "all 200ms",
                fontFamily: "inherit",
                opacity: processing ? 0.6 : 1,
                cursor: processing ? "not-allowed" : "text",
              }}
              onFocus={(e) => {
                if (!processing) e.target.style.borderColor = "#7C3AED"
                e.target.style.background = "#fff"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E2E8F0"
                e.target.style.background = "#F8FAFC"
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={processing || !input.trim()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: processing || !input.trim() 
                  ? "linear-gradient(135deg, #c4b5fd, #a78bfa)" 
                  : "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                border: "none",
                cursor: processing || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 200ms",
                boxShadow: !processing && input.trim() ? "0 4px 12px rgba(124, 58, 237, 0.3)" : "none",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!processing && input.trim()) {
                  e.target.style.transform = "scale(1.05)"
                  e.target.style.boxShadow = "0 6px 16px rgba(124, 58, 237, 0.4)"
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)"
                e.target.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.3)"
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export const ChatPanel = memo(ChatPanelComponent)
