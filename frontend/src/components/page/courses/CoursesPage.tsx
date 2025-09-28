import CourseCard from "../../general/course/CourseCard";
import AddCourseCard from "../../general/course/AddCourseCard";
import styles from "./CoursesPage.module.css";

export default function CoursePage() {
  return (
    <div className={styles.page}>
      <h1>Tus cursos</h1>
      <div className={styles.grid}>
        <CourseCard
          title="Algoritmos"
          author="Por Santiago Q"
          description="Curso referente a estructuras y algoritmos de datos"
          progress={60}
          color="linear-gradient(135deg, #93c5fd, #3b82f6)"
          icon="close"
        />

        <CourseCard
          title="Lógica y diagramas"
          author="Por Diego F."
          description="Aprendiendo a seguir secuencias con lógica"
          progress={40}
          color="linear-gradient(135deg, #86efac, #22c55e)"
          icon="close"
        />

        <CourseCard
          title="Computación"
          author="Por Adrian (Tú)"
          description="Aprendiendo lo básico de la computación"
          progress={80}
          color="linear-gradient(135deg, #f9a8d4, #ec4899)"
          icon="settings"
        />

        <AddCourseCard />
      </div>
    </div>
  );
}
