import { useState } from "react";
import { IoClose, IoRefresh } from "react-icons/io5";
import styles from "./CourseModal.module.css";
import type { Course } from "../../../schemas/course";
import { courseService } from "../../../services/CourseService";

export default function CourseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (c: Course) => void;
}) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [form, setForm] = useState({
    title: "",
    description: "",
    logo_path: "",
    invitation_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateInvitation = () => {
    const code = Math.random().toString(36).substring(2, 10);
    setForm({ ...form, invitation_code: code });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const created = await courseService.createCourse({
        title: form.title,
        description: form.description,
        logo_path: form.logo_path,
        invitation_code: form.invitation_code || undefined,
      });
      if (onCreated) onCreated(created);
      onClose();
    } catch (error: any) {
      console.error(error);
      setErr(error.message || "Error al crear curso");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Unirse con codigo:", form.invitation_code);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          <IoClose size={22} />
        </button>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={mode === "create" ? styles.active : ""}
            onClick={() => setMode("create")}
          >
            Crear curso
          </button>
          <button
            className={mode === "join" ? styles.active : ""}
            onClick={() => setMode("join")}
          >
            Unirse a curso
          </button>
        </div>

        {/* Formulario */}
        {mode === "create" ? (
          <form className={styles.form} onSubmit={handleCreate}>
            <label>Título</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <label>Logo</label>
            <input
              type="text"
              name="logo_path"
              value={form.logo_path}
              onChange={handleChange}
              placeholder="/assets/logo.png"
            />

            <label>Código de invitación</label>
            <div className={styles.invitation}>
              <input
                type="text"
                name="invitation_code"
                value={form.invitation_code}
                onChange={handleChange}
                placeholder="auto-generado si se deja vacío"
              />
              <button
                type="button"
                onClick={generateInvitation}
                className={styles.iconButton}
                title="Generar código"
              >
                <IoRefresh size={20} />
              </button>
            </div>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Creando..." : "Crear curso"}
            </button>
            {err && <p style={{ color: "red" }}>{err}</p>}
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleJoin}>
            <label>Código de invitación</label>
            <input
              type="text"
              name="invitation_code"
              value={form.invitation_code}
              onChange={handleChange}
              required
            />

            <button type="submit" className={styles.submit}>
              Unirse
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
