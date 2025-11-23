import { useState, useEffect } from "react";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoSendOutline,
  IoRefreshOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { assignmentDataService } from "../../../services";
import type { AssignmentData } from "../../../services/AssigmentDataService";

const styles = {
  container: {
    marginTop: "2rem",
    padding: "1.5rem",
    background: "#f8f9fa",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "1rem",
  },
  headerIcon: {
    fontSize: "24px",
    color: "#667eea",
  },
  headerTitle: {
    fontSize: "1.2rem",
    fontWeight: "600" as const,
    color: "#2d3748",
    margin: 0,
  },
  instructions: {
    fontSize: "0.95rem",
    color: "#4a5568",
    marginBottom: "1rem",
    lineHeight: "1.6",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px 16px",
    fontSize: "0.95rem",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    resize: "vertical" as const,
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    marginBottom: "1rem",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "12px 24px",
    fontSize: "0.95rem",
    fontWeight: "600" as const,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  feedbackContainer: {
    marginTop: "1.5rem",
    padding: "1.5rem",
    borderRadius: "12px",
    animation: "slideDown 0.3s ease",
  },
  feedbackSuccess: {
    background: "#f0fdf4",
    border: "2px solid #86efac",
  },
  feedbackError: {
    background: "#fef2f2",
    border: "2px solid #fca5a5",
  },
  feedbackHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "0.75rem",
  },
  feedbackIcon: {
    fontSize: "28px",
  },
  feedbackTitle: {
    fontSize: "1.1rem",
    fontWeight: "600" as const,
    margin: 0,
  },
  feedbackText: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#374151",
  },
  retryBtn: {
    marginTop: "1rem",
    background: "transparent",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "10px",
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: "600" as const,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "1.5rem",
    marginTop: "1.5rem",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "12px",
    color: "#667eea",
    fontWeight: "500" as const,
  },
  loadingIcon: {
    fontSize: "24px",
    animation: "spin 1s linear infinite",
  },
  previousAttempts: {
    marginTop: "2rem",
    padding: "1.5rem",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  attemptsTitle: {
    fontSize: "1rem",
    fontWeight: "600" as const,
    color: "#2d3748",
    marginBottom: "1rem",
  },
  attemptItem: {
    padding: "1rem",
    marginBottom: "0.75rem",
    background: "#f8f9fa",
    borderRadius: "8px",
    borderLeft: "4px solid",
  },
  attemptSuccess: {
    borderLeftColor: "#10b981",
  },
  attemptFail: {
    borderLeftColor: "#ef4444",
  },
  attemptAnswer: {
    fontSize: "0.9rem",
    color: "#4a5568",
    marginBottom: "0.5rem",
    fontStyle: "italic" as const,
  },
  attemptFeedback: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  attemptDate: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    marginTop: "0.25rem",
  },
};

interface Props {
  progressUuid: string;
  instructions?: string;
}

export default function AssignmentWidget({
  progressUuid,
  instructions,
}: Props) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<AssignmentData | null>(
    null
  );
  const [previousAttempts, setPreviousAttempts] = useState<AssignmentData[]>(
    []
  );

  // Cargar intentos previos
  useEffect(() => {
    loadPreviousAttempts();
  }, [progressUuid]);

  const loadPreviousAttempts = async () => {
    try {
      const data = await assignmentDataService.getByProgress(progressUuid);
      setPreviousAttempts(data);
    } catch (err) {
      console.error("Error cargando intentos previos:", err);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;

    setLoading(true);
    setCurrentFeedback(null);

    try {
      const data = await assignmentDataService.submitAnswer(
        progressUuid,
        answer.trim()
      );
      setCurrentFeedback(data);

      // Recargar intentos previos
      await loadPreviousAttempts();

      // Limpiar respuesta si fue exitosa
      if (data.success) {
        setAnswer("");
      }
    } catch (err: any) {
      console.error("Error al evaluar respuesta:", err);
      alert("Hubo un error al enviar tu respuesta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setCurrentFeedback(null);
    setAnswer("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <IoSparklesOutline style={styles.headerIcon} />
        <h3 style={styles.headerTitle}>Actividad Evaluada</h3>
      </div>

      {instructions && <p style={styles.instructions}>{instructions}</p>}

      <textarea
        style={{
          ...styles.textarea,
          borderColor: answer.trim() ? "#667eea" : "#e2e8f0",
        }}
        placeholder="Escribe tu respuesta aquí..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={loading}
      />

      <button
        style={{
          ...styles.submitBtn,
          ...(loading || !answer.trim() ? styles.submitBtnDisabled : {}),
        }}
        onClick={handleSubmit}
        disabled={loading || !answer.trim()}
        onMouseEnter={(e) => {
          if (!loading && answer.trim()) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(102, 126, 234, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <IoSendOutline size={18} />
        {loading ? "Evaluando..." : "Enviar Respuesta"}
      </button>

      {loading && (
        <div style={styles.loading}>
          <IoSparklesOutline style={styles.loadingIcon} />
          <span>La IA está evaluando tu respuesta...</span>
        </div>
      )}

      {currentFeedback && (
        <div
          style={{
            ...styles.feedbackContainer,
            ...(currentFeedback.success
              ? styles.feedbackSuccess
              : styles.feedbackError),
          }}
        >
          <div style={styles.feedbackHeader}>
            {currentFeedback.success ? (
              <IoCheckmarkCircleOutline
                style={{ ...styles.feedbackIcon, color: "#10b981" }}
              />
            ) : (
              <IoCloseCircleOutline
                style={{ ...styles.feedbackIcon, color: "#ef4444" }}
              />
            )}
            <h4 style={styles.feedbackTitle}>
              {currentFeedback.success
                ? "¡Excelente trabajo!"
                : "Necesitas mejorar"}
            </h4>
          </div>
          <p style={styles.feedbackText}>{currentFeedback.feedback}</p>

          {!currentFeedback.success && (
            <button
              style={styles.retryBtn}
              onClick={handleRetry}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#667eea";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#667eea";
              }}
            >
              <IoRefreshOutline size={18} />
              Intentar de nuevo
            </button>
          )}
        </div>
      )}

      {previousAttempts.length > 0 && (
        <div style={styles.previousAttempts}>
          <h4 style={styles.attemptsTitle}>
            Intentos anteriores ({previousAttempts.length})
          </h4>
          {previousAttempts
            .slice()
            .reverse()
            .map((attempt) => (
              <div
                key={attempt.uuid}
                style={{
                  ...styles.attemptItem,
                  ...(attempt.success
                    ? styles.attemptSuccess
                    : styles.attemptFail),
                }}
              >
                <div style={styles.attemptAnswer}>
                  <strong>Respuesta:</strong> {attempt.answer}
                </div>
                <div style={styles.attemptFeedback}>
                  <strong>Feedback:</strong> {attempt.feedback}
                </div>
                <div style={styles.attemptDate}>
                  {formatDate(attempt.creation_date)}
                </div>
              </div>
            ))}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
