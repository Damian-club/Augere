import { useState, useEffect, useRef } from "react";
import { IoSparklesOutline, IoAlert } from "react-icons/io5";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 0",
    flexDirection: "column" as const,
    gap: "16px",
  },
  box: {
    padding: "24px 32px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    maxWidth: "480px",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "32px",
    color: "#667eea",
    animation: "spin 1s linear infinite",
  },
  title: {
    fontWeight: 600,
    fontSize: "1.2rem",
    color: "#2d3748",
    margin: 0,
  },
  progressBar: {
    width: "100%",
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    transition: "width 0.3s ease",
  },
  status: {
    fontSize: "0.95rem",
    color: "#4a5568",
    textAlign: "center" as const,
  },
  details: {
    fontSize: "0.85rem",
    color: "#718096",
    textAlign: "center" as const,
    fontStyle: "italic" as const,
  },
  errorBox: {
    background: "#fed7d7",
    border: "2px solid #fc8181",
    padding: "16px",
    borderRadius: "12px",
    color: "#c53030",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
};

interface GenerationEvent {
  type: "progress" | "category" | "entry" | "complete" | "error";
  message: string;
  progress?: number;
  data?: any;
}

interface Props {
  courseUuid: string;
  prompt: string;
  onComplete: (schema: any) => void;
  onError: (error: string) => void;
}

export default function SchemaGeneratorSSE({
  courseUuid,
  prompt,
  onComplete,
  onError,
}: Props) {
  const [status, setStatus] = useState("Iniciando...");
  const [progress, setProgress] = useState(0);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!courseUuid) return;

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const connectSSE = (taskId: string) => {
      const eventSource = new EventSource(`${baseUrl}/schema/stream/${taskId}`);

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE conectado");
        retryCountRef.current = 0;
      };

      eventSource.addEventListener("progress", (event) => {
        const data: GenerationEvent = JSON.parse(event.data);
        setStatus(data.message);
        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
      });

      eventSource.addEventListener("category", (event) => {
        const data: GenerationEvent = JSON.parse(event.data);
        setDetails(`📁 ${data.message}`);
      });

      eventSource.addEventListener("entry", (event) => {
        const data: GenerationEvent = JSON.parse(event.data);
        setDetails(`📄 ${data.message}`);
      });

      eventSource.addEventListener("complete", (event) => {
        const data: GenerationEvent = JSON.parse(event.data);
        setStatus("¡Completado!");
        setProgress(100);

        eventSource.close();

        setTimeout(() => {
          onComplete(data.data);
        }, 1000);
        localStorage.removeItem("schema_generation");
      });

      eventSource.addEventListener("error_event", (event) => {
        const data: GenerationEvent = JSON.parse(event.data);
        setError(data.message);
        eventSource.close();
        onError(data.message);
        localStorage.removeItem("schema_generation");
      });

      eventSource.onerror = () => {
        console.warn("⚠️ SSE desconectado");

        eventSource.close();

        // 🔁 Reintento automático
        if (retryCountRef.current < 5) {
          retryCountRef.current++;
          setTimeout(() => startGeneration(), 2000);
        } else {
          setError("No se pudo reconectar con el servidor");
        }
      };
    };

    const startGeneration = async () => {
      try {
        const saved = localStorage.getItem("schema_generation");

        if (saved) {
          const parsed = JSON.parse(saved);

          if (parsed.courseUuid === courseUuid) {
            console.log("♻️ Restaurando desde localStorage...");
            connectSSE(parsed.taskId);
            return;
          }
        }

        // 🔍 1. Buscar tarea activa
        const res = await fetch(`${baseUrl}/schema/task/active/${courseUuid}`);
        const activeTask = await res.json();

        let taskId;

        if (activeTask) {
          console.log("🔄 Reconectando...");
          taskId = activeTask.uuid;
          localStorage.setItem(
            "schema_generation",
            JSON.stringify({
              courseUuid,
              taskId,
              prompt,
            }),
          );
        } else {
          console.log("🆕 Nueva tarea");

          const response = await fetch(
            `${baseUrl}/schema/generate/${courseUuid}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt }),
            },
          );

          const task = await response.json();
          taskId = task.uuid;

          localStorage.setItem(
            "schema_generation",
            JSON.stringify({
              courseUuid,
              taskId,
              prompt,
            }),
          );
        }

        connectSSE(taskId);
      } catch (err: any) {
        console.error(err);
        setError("Error iniciando generación");
        onError("Error iniciando generación");
      }
    };

    startGeneration();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [courseUuid, prompt]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <IoAlert style={{ fontSize: "24px" }} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.header}>
          <IoSparklesOutline style={styles.icon} />
          <h3 style={styles.title}>Generando Esquema</h3>
        </div>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        <div style={styles.status}>{status}</div>
        {details && <div style={styles.details}>{details}</div>}

        <div style={{ fontSize: "0.8rem", color: "#a0aec0" }}>{progress}%</div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
