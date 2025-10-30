import { useState } from "react";
import { IoClose, IoRefresh } from "react-icons/io5";
import styles from "./CourseModal.module.css";
import type { Course } from "../../../schemas/course";
import { courseService, studentService } from "../../../services";

export default function CourseModal({
  onClose,
  onCreated,
  onJoined,
}: {
  onClose: () => void;
  onCreated?: (c: Course) => void;
  onJoined?: () => void;
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

  const validateInvitationCode = (code: string): boolean => {
    const regex = /^[a-z0-9]{8}$/; // Solo minúsculas y números, 8 caracteres exactos
    return regex.test(code);
  };

  const validateCreateForm = (): string | null => {
    if (form.title.trim().length < 3)
      return "El título debe tener al menos 3 caracteres.";
    if (form.description.trim().length < 10)
      return "La descripción debe tener al menos 10 caracteres.";
    if (form.invitation_code && !validateInvitationCode(form.invitation_code))
      return "El código de invitación debe ser alfanumérico, en minúscula y de 8 caracteres.";
    return null;
  };

  const validateJoinForm = (): string | null => {
    if (!validateInvitationCode(form.invitation_code))
      return "Debes ingresar un código de invitación válido (8 caracteres alfanuméricos en minúscula).";
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const validationError = validateCreateForm();
    if (validationError) {
      setErr(validationError);
      return;
    }
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

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const validationError = validateJoinForm();
    if (validationError) {
      setErr(validationError);
      return;
    }

    setLoading(true);

    try {
      const joined = await studentService.joinCourse(form.invitation_code);
      console.log("Te uniste al curso:", joined);
      if (onJoined) onJoined();
      onClose();
    } catch (error: any) {
      console.log(error);
      setErr(error.message || "Error al unirse al curso.");
    } finally {
      setLoading(false);
    }
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
              placeholder="Introducción a React"
              required
            />

            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe brevemente el propósito del curso..."
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
                placeholder="8 caracteres alfanuméricos (opcional)"
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
            {err && <p className={styles.error}>{err}</p>}
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleJoin}>
            <label>Código de invitación</label>
            <input
              type="text"
              name="invitation_code"
              value={form.invitation_code}
              onChange={handleChange}
              placeholder="Ej: ab12cd34"
              required
            />

            <button type="submit" className={styles.submit}>
              Unirse
            </button>
            {err && <p className={styles.error}>{err}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
