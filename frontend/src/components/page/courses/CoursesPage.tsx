import CourseCard from "../../general/course/CourseCard";
import AddCourseCard from "../../general/course/AddCourseCard";
import styles from "./CoursesPage.module.css";
import type { Course } from "../../../schemas/course";
import { useEffect, useState } from "react";
import { courseService } from "../../../services";
import { pastelGradientFromString } from "../../../utils/colors";

export default function CoursePage() {
  const [created, setCreated] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className={styles.page}>
      <h1>Mis cursos</h1>
      <section className={styles.section}>
        <div className={styles["section-header"]}>
          <h2>Creados</h2>
        </div>
        <div className={styles.grid}>
          <AddCourseCard
            onCreated={handleCourseCreated}
            onJoined={fetchLists}
          />
          {created.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={`Por: ${c.tutor_name || "Tú"} (Tú)`}
              description={c.description}
              progress={30}
              color={pastelGradientFromString(c.title)}
              icon="settings"
            />
          ))}
        </div>
      </section>
      <hr />
      <section className={styles.section}>
        <div className={styles["section-header"]}>
          <h2>Inscritos</h2>
        </div>
        <div className={styles.grid}>
          {enrolled.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={`Por: ${c.tutor_name || "Tutor"}`}
              description={c.description}
              progress={0}
              color={pastelGradientFromString(c.title)}
              icon="close"
            />
          ))}
        </div>
      </section>
      {loading && <p className={styles.loader}>Cargando cursos...</p>}
    </div>
  );
}
