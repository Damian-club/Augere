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

export default function CoursePage() {
  const [created, setCreated] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [configCourseId, setConfigCourseId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>(
    {}
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

      const progresses = await progressService.listByStudent(user.uuid);

      const uniqueProgressMap = new Map<string, any>();
      for (const p of progresses) {
        const existing = uniqueProgressMap.get(p.entry_uuid);
        if (!existing || (!existing.finished && p.finished)) {
          uniqueProgressMap.set(p.entry_uuid, p);
        }
      }
      const uniqueProgresses = Array.from(uniqueProgressMap.values());

      const allCourses = [...created, ...enrolled];
      const progressByCourse: Record<
        string,
        { total: number; finished: number }
      > = {};

      for (const course of allCourses) {
        const schema = await schemaService.getFullSchemaByCourse(course.uuid);
        const entryUuids = schema.category_list.flatMap((cat) =>
          cat.entry_list.map((e) => e.uuid)
        );

        const total = entryUuids.length;
        const finished = uniqueProgresses.filter(
          (p) => entryUuids.includes(p.entry_uuid) && p.finished
        ).length;

        progressByCourse[course.uuid] = { total, finished };
      }

      const progressPercent: Record<string, number> = {};
      Object.entries(progressByCourse).forEach(
        ([courseUuid, { total, finished }]) => {
          progressPercent[courseUuid] =
            total > 0 ? Math.round((finished / total) * 100) : 0;
        }
      );

      setCourseProgress(progressPercent);
    } catch (err) {
      console.error("Error al obtener progreso:", err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (user?.uuid) {
      fetchProgress();
    }
  }, [user]);

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
              progress={courseProgress[c.uuid] || 0}
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
              progress={courseProgress[c.uuid] || 0}
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
