import CourseCard from "../../general/course/CourseCard";
import AddCourseCard from "../../general/course/AddCourseCard";
import styles from "./CoursesPage.module.css";
import type { Course } from "../../../schemas/course";
import { useEffect, useState } from "react";
import { courseService } from "../../../services";
import { pastelGradientFromString } from "../../../utils/colors";
import { authService } from "../../../services";

export default function CoursePage() {
  const [created, setCreated] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});

  const fetchLists = async () => {
    try {
      setLoading(true);

      const user = authService.getUser();
      const namesMap: Record<string, string> = {};

      if (user?.uuid && user?.name) {
        namesMap[user.uuid] = user.name;
      }

      const [c1, c2] = await Promise.all([
        courseService.getCreatedCourses(),
        courseService.getEnrolledCourses(),
      ]);

      setCreated(c1 || []);
      setEnrolled(c2 || []);

      const uniqueTutorIds = new Set<string>();

      c1?.forEach((course) => {
        if (course.tutor_id && !namesMap[course.tutor_id]) {
          uniqueTutorIds.add(course.tutor_id);
        }
      });

      c2?.forEach((course) => {
        if (course.tutor_id && !namesMap[course.tutor_id]) {
          uniqueTutorIds.add(course.tutor_id);
        }
      });

      if (uniqueTutorIds.size > 0) {
        const tutorPromises = Array.from(uniqueTutorIds).map(
          async (tutorId) => {
            try {
              const tutorInfo = await courseService.getUserInfo(tutorId);
              return { id: tutorId, name: tutorInfo.tutor_name };
            } catch (error) {
              console.error(`Error cargando tutor ${tutorId}:`, error);
              return { id: tutorId, name: "Tutor" };
            }
          }
        );

        const tutorResults = await Promise.all(tutorPromises);
        tutorResults.forEach(({ id, name }) => {
          namesMap[id] = name;
        });
      }

      setTutorNames(namesMap);
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

  const getAuthorName = (tutorId: string): string => {
    return tutorNames[tutorId] || "Cargando...";
  };

  return (
    <div className={styles.page}>
      <h1>Mis cursos</h1>

      <section className={styles.section}>
        <div className={styles["section-header"]}>
          <h2>Creados</h2>
        </div>

        <div className={styles.grid}>
          <AddCourseCard onCreated={handleCourseCreated} onJoined={fetchLists} />
          {created.map((c) => (
            <CourseCard
              key={c.uuid}
              title={c.title}
              author={`Por: ${getAuthorName(c.tutor_id)} (Tú)`}
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
              author={getAuthorName(c.tutor_id)}
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
