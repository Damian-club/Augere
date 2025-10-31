import { useState, useEffect } from "react";
import { courseService } from "../../../services";
import type { Course } from "../../../schemas/course";
import styles from "./CourseConfigPanel.module.css";
import {
  IoClose,
  IoSettingsSharp,
  IoBookOutline,
  IoPeople,
} from "react-icons/io5";
import toast from "react-hot-toast";

type Props = {
  courseId: string;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function CourseConfigPanel({
  courseId,
  onClose,
  onUpdated,
}: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "esquema" | "alumnos">(
    "general"
  );
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    logo_path: "",
    color: "#0000ff",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseWithTutor(courseId);
        setCourse(data);
        setForm({
          title: data.title,
          description: data.description || "",
          logo_path: data.logo_path || "",
          color: "#0000ff",
        });

        // delay para animacion
        setTimeout(() => setOpen(true), 10);
      } catch (err) {
        console.error("Error al cargar curso:", err);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (!course) return <p>Cargando configuración del curso...</p>;

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!course) return;
    try {
      await courseService.updateCourse({
        uuid: course.uuid,
        title: form.title,
        description: form.description,
        logo_path: form.logo_path,
      });
      toast.success("Curso actualizado correctamente");

      setOpen(false);
      setTimeout(() => {
        onClose();
        onUpdated?.(); // recarga los cursos
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar cambios");
    }
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className={styles.toastConfirm}>
          <p>¿Seguro de que deseas eliminar el curso?</p>
          <div className={styles.toastButtons}>
            <button
              className={styles.btnCancel}
              onClick={() => toast.dismiss(t.id)}
            >
              Cancelar
            </button>
            <button
              className={styles.btnDelete}
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const response = await courseService.deleteCourse(courseId);
                  toast.success(response.detail);
                  handleClose();
                  onUpdated?.();
                } catch (err: any) {
                  toast.error(err.message || "Error al eliminar curso");
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  return (
    <div className={`${styles.panel} ${open ? styles.open : ""}`}>
      <button className={styles.closeBtn} onClick={handleClose}>
        <IoClose />
      </button>

      <div className={styles.header}>
        <h2>{course.title}</h2>
        <small>UUID: {course.uuid}</small>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === "general" ? styles.active : ""}
          onClick={() => setActiveTab("general")}
        >
          <IoSettingsSharp style={{ marginRight: "5px" }} />
          General
        </button>
        <button
          className={activeTab === "esquema" ? styles.active : ""}
          onClick={() => setActiveTab("esquema")}
        >
          <IoBookOutline style={{ marginRight: "5px" }} />
          Esquema
        </button>
        <button
          className={activeTab === "alumnos" ? styles.active : ""}
          onClick={() => setActiveTab("alumnos")}
        >
          <IoPeople style={{ marginRight: "5px" }} />
          Alumnos
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "general" && (
          <>
            <div className={styles.formRowTwo}>
              <div>
                <label>Nombre del curso</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Logo</label>
                <input
                  type="text"
                  name="logo_path"
                  value={form.logo_path}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label>Color primario</label>
            <input type="color" name="color" value={form.color} disabled />

            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />

            <div className={styles.infoContainer}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Código de invitación:</span>
                <span className={styles.infoValue}>
                  {course.invitation_code}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Alumnos:</span>
                <span className={styles.infoValue}>{0}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Promedio progreso:</span>
                <span className={styles.infoValue}>{"0%"}</span>
              </div>
            </div>

            <div className={styles.buttonsContainer}>
              <button className={styles.saveBtn} onClick={handleSave}>
                Guardar
              </button>

              <button className={styles.deleteBtn} onClick={handleDelete}>
                Eliminar curso
              </button>
            </div>
          </>
        )}

        {activeTab === "esquema" && <div>Esquema del curso</div>}
        {activeTab === "alumnos" && <div>Lista de alumnos</div>}
      </div>
    </div>
  );
}
