import { useState } from "react";
import { IoClose, IoRefresh } from "react-icons/io5";
import styles from "./CourseModal.module.css";

export default function CourseModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [form, setForm] = useState({
    title: "",
    description: "",
    logo_path: "",
    invitation_code: "",
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateInvitation = () => {
    const code = Math.random().toString(36).substring(2, 10);
    setForm({ ...form, invitation_code: code });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", form);
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
          <form className={styles.form} onSubmit={handleSubmit}>
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

            <button type="submit" className={styles.submit}>
              Crear curso
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
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
