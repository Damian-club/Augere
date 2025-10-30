import CourseCard from "../../general/course/CourseCard";
import AddCourseCard from "../../general/course/AddCourseCard";
import styles from "./CoursesPage.module.css";
import type { Course } from "../../../schemas/course";
import { useEffect, useState } from "react";
import { courseService } from "../../../services/CourseService";
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
      console.log("Error al hacer la peticion de cursos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCourseCreated = (newCoure: Course) => {
    setCreated((prev) => [newCoure, ...prev]);
  };

  return (
    <div className={styles.page}>
      <h1>Tus cursos</h1>
      <section>
        <h2>Creados</h2>
        <div className={styles.grid}>
          {created.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={c.tutor_id}
              description={c.description}
              progress={0}
              color={pastelGradientFromString(c.title)}
              icon="settings"
            />
          ))}
          <AddCourseCard onCreated={handleCourseCreated} />
        </div>
      </section>
      <hr style={{ margin: "1.5rem 0" }} />
      <section>
        <h2>Inscrito</h2>
        <div className={styles.grid}>
          {enrolled.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={c.tutor_id}
              description={c.description}
              progress={0}
              color={`linear-gradient(135deg, #93c5fd, #3b82f6)`}
              icon="close"
            />
          ))}
        </div>
      </section>
      {loading && <p>Cargando cursos...</p>}
    </div>
  );
}

// DESPUES DEL H1
// <div className={styles.grid}>
//   <CourseCard
//     title="Algoritmos"
//     author="Por Santiago Q"
//     description="Curso referente a estructuras y algoritmos de datos"
//     progress={60}
//     color="linear-gradient(135deg, #93c5fd, #3b82f6)"
//     icon="close"
//   />

//   <CourseCard
//     title="Lógica y diagramas"
//     author="Por Diego F."
//     description="Aprendiendo a seguir secuencias con lógica"
//     progress={40}
//     color="linear-gradient(135deg, #86efac, #22c55e)"
//     icon="close"
//   />

//   <CourseCard
//     title="Computación"
//     author="Por Adrian (Tú)"
//     description="Aprendiendo lo básico de la computación"
//     progress={80}
//     color="linear-gradient(135deg, #f9a8d4, #ec4899)"
//     icon="settings"
//   />

//   <AddCourseCard />
// </div>
