import { useState, useEffect } from "react";
import { courseService } from "../../../services";
import type { Course } from "../../../schemas/course";
import styles from "./CourseConfigPanel.module.css";
import { IoClose } from "react-icons/io5";

type Props = {
  courseId: string;
  onClose: () => void;
};

export default function CourseConfigPanel({ courseId, onClose }: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "esquema" | "alumnos">(
    "general"
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseWithTutor(courseId);
        setCourse(data);

        // delay para la animacion
        setTimeout(() => {
          setOpen(true);
        }, 10);
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

  return (
    <div className={`${styles.panel} ${open ? styles.open : ""}`}>
      <button className={styles.closeBtn} onClick={handleClose}>
        <IoClose />
      </button>

      <div className={styles.tabs}>
        <button
          className={activeTab === "general" ? styles.active : ""}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button
          className={activeTab === "esquema" ? styles.active : ""}
          onClick={() => setActiveTab("esquema")}
        >
          Esquema
        </button>
        <button
          className={activeTab === "alumnos" ? styles.active : ""}
          onClick={() => setActiveTab("alumnos")}
        >
          Alumnos
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "general" && (
          <>
            <label>Nombre del curso</label>
            <input type="text" value={course.title} readOnly />

            <label>Color primario</label>
            <input type="color" value="#0000ff" readOnly disabled />

            <label>Logo</label>
            <input type="text" value={course.logo_path || ""} readOnly />

            <label>Descripción</label>
            <textarea value={course.description} readOnly />

            <button>Guardar</button>
          </>
        )}

        {activeTab === "esquema" && <div>Esquema del curso</div>}
        {activeTab === "alumnos" && <div>Lista de alumnos</div>}
      </div>
    </div>
  );
}
