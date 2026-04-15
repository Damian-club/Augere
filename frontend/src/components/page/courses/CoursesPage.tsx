import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CourseCard from "../../general/course/CourseCard";
import AddCourseCard from "../../general/course/AddCourseCard";
import CourseConfigPanel from "../../general/courseConfig/CourseConfigPanel";
import {
  courseService,
  studentService,
  progressService,
  schemaService,
} from "../../../services";
import { pastelGradientFromString } from "../../../utils/colors";
import type { Course } from "../../../schemas/course";
import styles from "./CoursesPage.module.css";
import useUser from "../../../hooks/useUser";
import { environment } from "../../../config/environment";
import SchemaGeneratorSSE from "../../sse/SchemaGeneratorSSE";

export default function CoursePage() {
  const [created, setCreated] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [configCourseId, setConfigCourseId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [progressCreatedState, setProgressCreated] = useState<
    Record<string, number>
  >({});
  const [progressEnrolledState, setProgressEnrolled] = useState<
    Record<string, number>
  >({});

  const [courseProgress, setCourseProgress] = useState<Record<string, number>>(
    {},
  );
  const { user } = useUser();

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

  const fetchProgress = async () => {
    try {
      if (!user?.uuid) return;

      const progressCreated: Record<string, number> = {};
      const progressEnrolled: Record<string, number> = {};

      // ================================
      // 🔵 1. CALCULAR PROMEDIO (CREADOS)
      // ================================
      for (const course of created) {
        try {
          // Obtener esquema
          const schema = await schemaService.getFullSchemaByCourse(course.uuid);

          if (!schema) {
            progressCreated[course.uuid] = 0;
            continue;
          }

          const entryUuids = schema.category_list.flatMap((cat) =>
            cat.entry_list.map((e) => e.uuid),
          );
          const total = entryUuids.length;

          // Obtener estudiantes inscritos
          const students = await studentService.getByCourse(course.uuid);
          if (!students || students.length === 0) {
            progressCreated[course.uuid] = 0;
            continue;
          }

          const percentages: number[] = [];

          for (const s of students) {
            // Obtener el student record real
            const srResp = await fetch(
              `${environment.api}/student/by-user-course/${s.student_uuid}/${course.uuid}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              },
            );

            if (!srResp.ok) {
              percentages.push(0);
              continue;
            }

            const srData = await srResp.json();
            const realStudentRecordUuid = srData.uuid;

            const progresses = await progressService.listByStudent(
              realStudentRecordUuid,
            );

            // Normalize progress → quedarnos con el último por entry
            const unique = new Map<string, any>();
            for (const p of progresses) {
              const existing = unique.get(p.entry_uuid);
              if (!existing || (!existing.finished && p.finished)) {
                unique.set(p.entry_uuid, p);
              }
            }

            const uniqueProgresses = [...unique.values()];
            const finished = uniqueProgresses.filter(
              (p) => entryUuids.includes(p.entry_uuid) && p.finished,
            ).length;

            const percent = total > 0 ? (finished / total) * 100 : 0;
            percentages.push(percent);
          }

          // Promedio final del curso
          const average =
            percentages.length > 0
              ? Math.round(
                  percentages.reduce((a, b) => a + b, 0) / percentages.length,
                )
              : 0;

          progressCreated[course.uuid] = average;
        } catch (err) {
          console.error(
            `Error en progreso de curso creado ${course.uuid}:`,
            err,
          );
          progressCreated[course.uuid] = 0;
        }
      }

      // =======================================
      // 🟢 2. CALCULAR PROGRESO PERSONAL (INSCRITOS)
      // =======================================
      for (const course of enrolled) {
        try {
          // Obtener student record REAL del usuario
          const srResp = await fetch(
            `${environment.api}/student/by-user-course/${user.uuid}/${course.uuid}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!srResp.ok) {
            progressEnrolled[course.uuid] = 0;
            continue;
          }

          const studentRecord = await srResp.json();
          const studentRecordUuid = studentRecord.uuid;

          const progresses =
            await progressService.listByStudent(studentRecordUuid);

          // Normalizar
          const unique = new Map<string, any>();
          for (const p of progresses) {
            const existing = unique.get(p.entry_uuid);
            if (!existing || (!existing.finished && p.finished)) {
              unique.set(p.entry_uuid, p);
            }
          }
          const uniqueProgresses = [...unique.values()];

          // Obtener entries
          const schema = await schemaService.getFullSchemaByCourse(course.uuid);

          if (!schema) {
            progressEnrolled[course.uuid] = 0;
            continue;
          }

          const entryUuids = schema.category_list.flatMap((cat) =>
            cat.entry_list.map((e) => e.uuid),
          );

          const total = entryUuids.length;
          const finished = uniqueProgresses.filter(
            (p) => entryUuids.includes(p.entry_uuid) && p.finished,
          ).length;

          progressEnrolled[course.uuid] =
            total > 0 ? Math.round((finished / total) * 100) : 0;
        } catch (err) {
          console.error(`Error en progreso de inscrito ${course.uuid}:`, err);
          progressEnrolled[course.uuid] = 0;
        }
      }

      // Unimos ambos resultados
      // al final de fetchProgress()
      console.log(
        "CREATED:",
        created.map((c) => c.uuid),
      );
      console.log(
        "ENROLLED:",
        enrolled.map((c) => c.uuid),
      );

      console.log("progressCreated (promedio):", progressCreated);
      console.log("progressEnrolled (personal):", progressEnrolled);

      setProgressCreated(progressCreated);
      setProgressEnrolled(progressEnrolled);
      setCourseProgress({ ...progressEnrolled, ...progressCreated });
    } catch (err) {
      console.error("Error general en fetchProgress:", err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (created.length > 0 || enrolled.length > 0) {
      fetchProgress();
    }
  }, [created, enrolled, user?.uuid]);

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
                    prev.filter((c) => c.uuid !== course.uuid),
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
      { duration: 8000 },
    );
  };
  const activeGeneration = localStorage.getItem("schema_generation");

  let generatingCourseId: string | null = null;
  let generatingPrompt: string | null = null;

  if (activeGeneration) {
    const parsed = JSON.parse(activeGeneration);
    generatingCourseId = parsed.courseUuid;
    generatingPrompt = parsed.prompt;
  }

  return (
    <div className={styles.page}>
      <h1>Mis cursos</h1>

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
          {created.map((c) =>
            c.uuid === generatingCourseId ? (
              <SchemaGeneratorSSE
                courseUuid={c.uuid}
                prompt={generatingPrompt || ""}
                onComplete={() => {
                  localStorage.removeItem("schema_generation");
                  fetchLists(); // recargar cursos
                }}
                onError={() => {
                  localStorage.removeItem("schema_generation");
                }}
              />
            ) : (
              <CourseCard
                key={c.uuid}
                title={c.title}
                author={`Por: ${"Tú"}`}
                description={c.description}
                progress={progressCreatedState[c.uuid] || 0}
                color={pastelGradientFromString(c.title)}
                logo_path={c.logo_path}
                icon="settings"
                onIconClick={() => setConfigCourseId(c.uuid)}
                onClick={() => navigate(`/course/${c.uuid}?mode=tutor`)}
              />
            ),
          )}
        </div>
      </section>

      <hr />

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
              progress={progressEnrolledState[c.uuid] || 0}
              color={pastelGradientFromString(c.title)}
              logo_path={c.logo_path}
              icon="close"
              onDelete={() => handleUnenroll(c)}
              onClick={() => navigate(`/course/${c.uuid}?mode=student`)}
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
