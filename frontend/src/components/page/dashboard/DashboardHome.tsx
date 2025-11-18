import { useEffect, useState } from "react";
import styles from "./DashboardHome.module.css";
import {
  authService,
  courseService,
  progressService,
  schemaService,
} from "../../../services";
import { environment } from "../../../config/environment";

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

        const coursesWithProgress: CourseWithProgress[] = [];

        // Para cada curso, obtén el progreso correcto
        for (const course of allCourses) {
          try {
            // 1. Obtener Student Record UUID
            const response = await fetch(
              `${environment.api}/student/by-user-course/${userData.uuid}/${course.uuid}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );

            let studentRecordUuid: string;

            if (response.ok) {
              // Es estudiante
              const studentRecord = await response.json();
              studentRecordUuid = studentRecord.uuid;
            } else {
              // Es tutor o no inscrito, progreso = 0
              coursesWithProgress.push({
                uuid: course.uuid,
                name: course.title,
                completion_percentage: 0,
              });
              continue;
            }

            // 2. Obtener progresos con el Student Record UUID correcto
            const progresses = await progressService.listByStudent(studentRecordUuid);

            // 3. Eliminar duplicados
            const uniqueProgressMap = new Map<string, any>();
            for (const p of progresses) {
              const existing = uniqueProgressMap.get(p.entry_uuid);
              if (!existing || (!existing.finished && p.finished)) {
                uniqueProgressMap.set(p.entry_uuid, p);
              }
            }
            const uniqueProgresses = Array.from(uniqueProgressMap.values());

            // 4. Obtener esquema del curso
            const schema = await schemaService.getFullSchemaByCourse(course.uuid);
            const entryUuids = schema.category_list.flatMap((cat) =>
              cat.entry_list.map((e) => e.uuid)
            );

            // 5. Calcular progreso
            const total = entryUuids.length;
            const finished = uniqueProgresses.filter(
              (p) => entryUuids.includes(p.entry_uuid) && p.finished
            ).length;
            const completion = total > 0 ? Math.round((finished / total) * 100) : 0;

            console.log(`📊 ${course.title}: ${finished}/${total} = ${completion}%`);

            coursesWithProgress.push({
              uuid: course.uuid,
              name: course.title,
              completion_percentage: completion,
            });
          } catch (err) {
            console.error(`Error procesando curso ${course.title}:`, err);
            coursesWithProgress.push({
              uuid: course.uuid,
              name: course.title,
              completion_percentage: 0,
            });
          }
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
              <span className={styles.percentage}>
                {course.completion_percentage}%
              </span>
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