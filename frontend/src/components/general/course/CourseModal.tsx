import { useState } from "react";
import { IoClose, IoRefresh } from "react-icons/io5";
import toast from "react-hot-toast";
import styles from "./CourseModal.module.css";
import type { Course } from "../../../schemas/course";
import { courseService, studentService } from "../../../services";

export default function CourseModal({
  onClose,
  onCreated,
  onJoined,
  mode: initialMode,
}: {
  onClose: () => void;
  onCreated?: (c: Course) => void;
  onJoined?: () => void;
  mode?: "create" | "join";
}) {
  const [mode, setMode] = useState<"create" | "join">(initialMode || "create");
  const [form, setForm] = useState({
    title: "",
    description: "",
    logo_path: "",
    invitation_code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateInvitation = () => {
    const code = Math.random().toString(36).substring(2, 10);
    setForm({ ...form, invitation_code: code });
    toast.success("Código de invitación generado");
  };

  const validateInvitationCode = (code: string): boolean =>
    /^[a-z0-9]{8}$/.test(code);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.length < 3)
      return toast.error("El título debe tener al menos 3 caracteres");
    if (form.description.length < 10)
      return toast.error("La descripción debe tener al menos 10 caracteres");

    setLoading(true);
    try {
      const created = await courseService.createCourse({
        title: form.title,
        description: form.description,
        logo_path: form.logo_path,
        invitation_code: form.invitation_code || undefined,
      });
      toast.success("Curso creado correctamente 🎉");
      onCreated?.(created);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error al crear el curso");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInvitationCode(form.invitation_code))
      return toast.error("Código inválido (8 caracteres alfanuméricos)");

    setLoading(true);
    try {
      await studentService.joinCourse(form.invitation_code);
      toast.success("Te uniste al curso correctamente 🎉");
      onJoined?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error al unirse al curso");
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

        {/* Tabs solo si no se fijó el modo */}
        {!initialMode && (
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
        )}

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
              placeholder="https://..."
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
              >
                <IoRefresh size={20} />
              </button>
            </div>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Creando..." : "Crear curso"}
            </button>
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

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Uniéndose..." : "Unirse"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
