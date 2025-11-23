import { useState, useEffect, useRef } from "react";
import {
  IoSparklesOutline,
  IoSendOutline,
  IoCloseOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { aiChatService } from "../../../services";
import type { AiChat } from "../../../schemas/aiChat";

const styles = {
  chatContainer: {
    position: "fixed" as const,
    bottom: "20px",
    right: "20px",
    zIndex: 9999,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  fab: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "50px",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
    fontSize: "15px",
    fontWeight: "600" as const,
    transition: "all 0.3s ease",
  },
  fabIcon: {
    fontSize: "20px",
  },
  chatBox: {
    position: "absolute" as const,
    bottom: "0",
    right: "0",
    width: "380px",
    maxWidth: "90vw",
    height: "550px",
    maxHeight: "80vh",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    transform: "scale(0.95) translateY(20px)",
    opacity: 0,
    pointerEvents: "none" as const,
    transition: "all 0.3s ease",
  },
  chatBoxOpen: {
    transform: "scale(1) translateY(0)",
    opacity: 1,
    pointerEvents: "auto" as const,
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "20px 20px 0 0",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600" as const,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    transition: "all 0.2s ease",
  },
  messages: {
    flex: 1,
    padding: "20px",
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    background: "#f8f9fa",
  },
  message: {
    maxWidth: "80%",
    padding: "12px 16px",
    borderRadius: "16px",
    wordWrap: "break-word" as const,
    fontSize: "0.95rem",
    lineHeight: "1.5",
    animation: "slideIn 0.3s ease",
  },
  messageUser: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    alignSelf: "flex-end",
    borderBottomRightRadius: "4px",
  },
  messageAI: {
    background: "white",
    color: "#2d3748",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  messageError: {
    background: "#fed7d7",
    color: "#c53030",
    alignSelf: "center",
    maxWidth: "90%",
    fontSize: "0.9rem",
    borderRadius: "12px",
  },
  errorIcon: {
    display: "inline-block",
    marginRight: "6px",
    verticalAlign: "middle",
  },
  inputArea: {
    padding: "16px 20px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "10px",
    background: "white",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s ease",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    transition: "all 0.2s ease",
  },
  actionButtons: {
    padding: "0 20px 12px",
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500" as const,
    transition: "all 0.2s ease",
  },
  clearBtn: {
    color: "#e53e3e",
  },
  retryBtn: {
    color: "#3182ce",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px 20px",
    color: "#a0aec0",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
    opacity: 0.5,
  },
  loading: {
    padding: "16px 20px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "16px",
    color: "#667eea",
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    maxWidth: "80%",
  },
  loadingIcon: {
    fontSize: "20px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontWeight: "500" as const,
    fontSize: "0.95rem",
  },
  loadingDots: {
    display: "inline-flex",
    gap: "4px",
    marginLeft: "4px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#667eea",
    animation: "bounce 1.4s infinite ease-in-out both",
  },
};

interface Props {
  progressUuid: string;
}

export default function AIChatWidget({ progressUuid }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AiChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar historial de mensajes al abrir
  useEffect(() => {
    if (open && progressUuid) {
      loadChatHistory();
    }
  }, [open, progressUuid]);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const history = await aiChatService.getByProgress(progressUuid);
      setMessages(history);
      setError(null);
    } catch (err) {
      console.error("Error cargando historial de chat:", err);
      setError("No se pudo cargar el historial del chat");
    }
  };

  const handleSend = async (messageToSend?: string) => {
    const textToSend = messageToSend || message.trim();

    if (!textToSend || loading) return;

    setMessage("");
    setLoading(true);
    setError(null);
    setLastFailedMessage(null);

    // Agregar mensaje del usuario optimistamente
    const tempUserMsg: AiChat = {
      uuid: `temp-${Date.now()}`,
      content: textToSend,
      author: "user",
      progress_uuid: progressUuid,
      creation_date: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await aiChatService.sendPrompt(progressUuid, textToSend);

      // Reemplazar mensaje temporal con el real y agregar respuesta de IA
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.uuid !== tempUserMsg.uuid);
        return [...filtered, response.user, response.ai];
      });
    } catch (err: any) {
      console.error("Error en chat IA:", err);

      // Remover mensaje temporal si hay error
      setMessages((prev) => prev.filter((m) => m.uuid !== tempUserMsg.uuid));

      // Guardar el mensaje que falló para poder reintentarlo
      setLastFailedMessage(textToSend);

      // Extraer mensaje de error más legible
      let errorMsg = "No se pudo enviar el mensaje. ";

      if (err.message?.includes("403")) {
        errorMsg += "Error de permisos en el servidor.";
      } else if (err.message?.includes("400")) {
        errorMsg +=
          "Error en el formato de la solicitud. Por favor contacta al administrador.";
      } else if (err.message?.includes("500")) {
        errorMsg += "Error interno del servidor.";
      } else {
        errorMsg += "Por favor intenta de nuevo.";
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage);
    }
  };

  const handleClear = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres borrar el historial de chat?"
      )
    ) {
      setMessages([]);
      setError(null);
      setLastFailedMessage(null);
    }
  };

  return (
    <div style={styles.chatContainer}>
      {/* Chat Box */}
      <div
        style={{
          ...styles.chatBox,
          ...(open ? styles.chatBoxOpen : {}),
        }}
      >
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>
            <IoSparklesOutline style={{ fontSize: "20px" }} />
            Asistente IA
          </h3>
          <button
            style={styles.closeBtn}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <IoCloseOutline />
          </button>
        </div>

        <div style={styles.messages}>
          {messages.length === 0 && !error ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <p>Hazme una pregunta sobre este tema</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={msg.uuid || i}
                  style={{
                    ...styles.message,
                    ...(msg.author === "user"
                      ? styles.messageUser
                      : styles.messageAI),
                  }}
                >
                  {msg.content}
                </div>
              ))}

              {error && (
                <div style={{ ...styles.message, ...styles.messageError }}>
                  <IoWarningOutline style={styles.errorIcon} />
                  {error}
                </div>
              )}

              {loading && (
                <div style={styles.loading}>
                  <IoSparklesOutline style={styles.loadingIcon} />
                  <div>
                    <span style={styles.loadingText}>Pensando</span>
                    <div style={styles.loadingDots}>
                      <span
                        style={{ ...styles.dot, animationDelay: "-0.32s" }}
                      />
                      <span
                        style={{ ...styles.dot, animationDelay: "-0.16s" }}
                      />
                      <span style={styles.dot} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div>
          <div style={styles.inputArea}>
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              style={styles.input}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: loading || !message.trim() ? 0.5 : 1,
                cursor: loading || !message.trim() ? "not-allowed" : "pointer",
              }}
              onClick={() => handleSend()}
              disabled={loading || !message.trim()}
              onMouseEnter={(e) => {
                if (!loading && message.trim()) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <IoSendOutline />
            </button>
          </div>

          {(messages.length > 0 || error) && (
            <div style={styles.actionButtons}>
              {error && lastFailedMessage && (
                <button
                  style={{ ...styles.actionBtn, ...styles.retryBtn }}
                  onClick={handleRetry}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#bee3f8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <IoRefreshOutline />
                  Reintentar
                </button>
              )}

              {messages.length > 0 && (
                <button
                  style={{ ...styles.actionBtn, ...styles.clearBtn }}
                  onClick={handleClear}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fed7d7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <IoTrashOutline />
                  Limpiar chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAB Button */}
      {!open && (
        <button
          style={styles.fab}
          onClick={() => setOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 12px 32px rgba(102, 126, 234, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(102, 126, 234, 0.4)";
          }}
        >
          <IoSparklesOutline style={styles.fabIcon} />
          <span>¿Tienes preguntas?</span>
        </button>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
