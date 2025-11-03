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
import CourseGeneralTab from "./CourseGeneralTab";
import CourseSchemaTab2 from "./CourseSchemaTab2";
import CourseStudentsTab from "./CourseStudentsTab";

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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseWithTutor(courseId);
        setCourse(data);
        setTimeout(() => setOpen(true), 10);
      } catch (err) {
        console.error("Error al cargar curso:", err);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  if (!course) return <p>Cargando configuración del curso...</p>;

  return (
    <div className={`${styles.panel} ${open ? styles.open : ""}`}>
      <button className={styles.closeBtn} onClick={handleClose}>
        <IoClose />
      </button>

      <div className={styles.header}>
        <h2>{course.title}</h2>
        <small>ID curso: {course.uuid}</small>
      </div>

      {/* Tabs */}
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

      {/* Contenido Principal */}
      <div className={styles.content}>
        {activeTab === "general" && (
          <CourseGeneralTab
            course={course}
            onClose={handleClose}
            onUpdated={onUpdated}
          />
        )}
        {activeTab === "esquema" && <CourseSchemaTab2 course={course} />}
        {activeTab === "alumnos" && <CourseStudentsTab course={course} />}
      </div>
    </div>
  );
}
