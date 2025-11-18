import { useEffect, useState } from "react";
import { courseService } from "../../../services";
import toast from "react-hot-toast";
import styles from "./CourseGeneralTab.module.css";
import type { Course } from "../../../schemas/course";

type Props = {
  course: Course;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function CourseGeneralTab({
  course,
  onClose,
  onUpdated,
}: Props) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description || "",
    logo_path: course.logo_path || "",
    color: "#0000ff",
  });

  const [stats, setStats] = useState({
    student_count: 0,
    completion_percentage: 0,
  });

  useEffect(() => {
    const fetchCourseSummary = async () => {
      try {
        const data = await courseService.getPrivateSummary(course.uuid);
        setStats({
          student_count: data.student_count || 0,
          completion_percentage: data.completion_percentage || 0,
        });
      } catch (err) {
        console.error("Error al cargar resumen del curso:", err);
      }
    };
    fetchCourseSummary();
  }, [course.uuid]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await courseService.updateCourse({
        uuid: course.uuid,
        title: form.title,
        description: form.description,
        logo_path: form.logo_path,
      });
      toast.success("Curso actualizado correctamente");
      onClose();
      onUpdated?.();
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
                  const response = await courseService.deleteCourse(
                    course.uuid
                  );
                  toast.success(response.detail);
                  onClose();
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
    <div className={styles.content}>
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
          <span className={styles.infoLabel}>Código invitación:</span>
          <span className={styles.infoValue}>{course.invitation_code}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Alumnos:</span>
          <span className={styles.infoValue}>{stats.student_count}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Promedio progreso:</span>
          <span className={styles.infoValue}>
            {stats.completion_percentage*100}%
          </span>
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
    </div>
  );
}
