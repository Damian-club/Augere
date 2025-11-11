import { useEffect, useState } from "react";
import styles from "./DashboardHome.module.css";
import {
  authService,
  courseService,
  progressService,
  schemaService,
} from "../../../services";

type CourseWithProgress = {
  uuid: string;
  name: string;
  completion_percentage: number;
};

export default function DashboardHome() {
  const [user, setUser] = useState<{ name: string; uuid: string } | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalProgress, setGlobalProgress] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        const [created, enrolled] = await Promise.all([
          courseService.getCreatedCourses(),
          courseService.getEnrolledCourses(),
        ]);

        const courseMap = new Map<string, string>();
        const allCourses = [...created, ...enrolled].filter((c) => {
          if (courseMap.has(c.uuid)) return false;
          courseMap.set(c.uuid, c.title);
          return true;
        });

        const progresses = await progressService.listByStudent(userData.uuid);
        const coursesWithProgress: CourseWithProgress[] = [];

        for (const course of allCourses) {
          const schema = await schemaService.getFullSchemaByCourse(course.uuid);
          const entryUuids = schema.category_list.flatMap((cat) =>
            cat.entry_list.map((e) => e.uuid)
          );

          const total = entryUuids.length;
          const finished = progresses.filter(
            (p) => entryUuids.includes(p.entry_uuid) && p.finished
          ).length;
          const completion =
            total > 0 ? Math.round((finished / total) * 100) : 0;

          coursesWithProgress.push({
            uuid: course.uuid,
            name: course.title,
            completion_percentage: completion,
          });
        }

        setCourses(coursesWithProgress);

        const global = coursesWithProgress.length
          ? Math.round(
              coursesWithProgress.reduce(
                (acc, c) => acc + c.completion_percentage,
                0
              ) / coursesWithProgress.length
            )
          : 0;
        setGlobalProgress(global);
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className={styles.loader}>Cargando datos...</div>;

  const completedCourses = courses.filter(
    (c) => c.completion_percentage === 100
  ).length;
  const totalCourses = courses.length;

  return (
    <div className={styles.dashboardHome}>
      <h1>Inicio</h1>
      <h2>Bienvenido de vuelta, {user ? user.name : "Cargando..."}</h2>

      <div className={styles.content}>
        {/* Progreso Circular */}
        <div className={styles.progressCard}>
          <div
            className={styles.circle}
            style={
              { "--progress": `${globalProgress}%` } as React.CSSProperties
            }
          >
            <span>{globalProgress}%</span>
          </div>
          <p>
            <strong>
              {completedCourses}/{totalCourses}
            </strong>{" "}
            completados
          </p>
          <p>Tu progreso total en los cursos</p>
        </div>

        <div className={styles.courseList}>
          {courses.map((course, i) => (
            <div key={i} className={styles.courseRow}>
              <span>{course.name}</span>
              <div className={styles.bar}>
                <div style={{ width: `${course.completion_percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>{totalCourses}</h3>
          <p>Cursos activos</p>
        </div>
      </div>
    </div>
  );
}
