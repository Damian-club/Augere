import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import CourseCard from "../../general/course/CourseCard";
import AddCourseCard from "../../general/course/AddCourseCard";
import CourseConfigPanel from "../../general/courseConfig/CourseConfigPanel";
import { courseService, studentService } from "../../../services";
import { pastelGradientFromString } from "../../../utils/colors";
import type { Course } from "../../../schemas/course";
import styles from "./CoursesPage.module.css";

export default function CoursePage() {
  const [created, setCreated] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [configCourseId, setConfigCourseId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchLists = async () => {
    try {
      setLoading(true);
      const [c1, c2] = await Promise.all([
        courseService.getCreatedCourses(),
        courseService.getEnrolledCourses(),
      ]);
      setCreated(c1 || []);
      setEnrolled(c2 || []);
    } catch (err) {
      console.error("Error al hacer la peticion de cursos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCourseCreated = (newCourse: Course) => {
    setCreated((prev) => [newCourse, ...prev]);
  };

  const handleUnenroll = (course: Course) => {
    toast(
      (t) => (
        <div className={styles.toastConfirm}>
          <p>
            ¿Seguro que deseas desinscribirte de <strong>{course.title}</strong>
            ?
          </p>
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
                  await studentService.unenrollFromCourse(course.uuid);
                  setEnrolled((prev) =>
                    prev.filter((c) => c.uuid !== course.uuid)
                  );
                  toast.success("Te has desinscrito correctamente");
                } catch (err: any) {
                  toast.error(err.message || "Error al desinscribirse");
                }
              }}
            >
              Desinscribirse
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  return (
    <div className={styles.page}>
      <h1>Mis cursos</h1>

      {/* Cursos Creados */}
      <section className={styles.section}>
        <div className={styles["section-header"]}>
          <h2>Creados</h2>
        </div>
        <div className={styles.grid}>
          <AddCourseCard
            mode="create"
            onCreated={handleCourseCreated}
            onJoined={fetchLists}
          />
          {created.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={`Por: ${"Tú"}`}
              description={c.description}
              progress={30}
              color={pastelGradientFromString(c.title)}
              logo_path={c.logo_path}
              icon="settings"
              onIconClick={() => setConfigCourseId(c.uuid)}
              onClick={() => navigate(`/course/${c.uuid}`)}
            />
          ))}
        </div>
      </section>

      <hr />

      {/* Cursos Inscritos */}
      <section className={styles.section}>
        <div className={styles["section-header"]}>
          <h2>Inscritos</h2>
        </div>
        <div className={styles.grid}>
          <AddCourseCard mode="join" onJoined={fetchLists} />
          {enrolled.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={`Por: ${c.tutor?.name || "Tutor"}`}
              description={c.description}
              progress={0}
              color={pastelGradientFromString(c.title)}
              logo_path={c.logo_path}
              icon="close"
              onDelete={() => handleUnenroll(c)}
              onClick={() => navigate(`/course/${c.uuid}`)}
            />
          ))}
        </div>
      </section>

      {loading && <p className={styles.loader}>Cargando cursos...</p>}

      {configCourseId && (
        <CourseConfigPanel
          courseId={configCourseId}
          onClose={() => setConfigCourseId(null)}
          onUpdated={fetchLists}
        />
      )}
    </div>
  );
}
