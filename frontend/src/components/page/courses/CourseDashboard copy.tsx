import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  IoHomeOutline,
  IoBookOutline,
  IoSettingsOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import CourseSchemaView from "../../general/courseSchema/CourseSchemaView";
import type { FullSchema, Entry } from "../../../schemas/schema";
import style from "./CourseDashboard.module.css";
import AIChatWidget from "../../general/AIChatWidget/AIChatWidget";
import { authService, schemaService, courseService } from "../../../services";
import type { Course } from "../../../schemas/course";
import type { User } from "../../../schemas/auth";
import { progressService } from "../../../services";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import { useUser } from "../../../hooks/useUser";

export default function CourseDashboard() {
  const { uuid } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [progressUuid, setProgressUuid] = useState<string | null>(null);
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [progressMap, setProgressMap] = useState<
    Record<string, { finished: boolean; uuid?: string }>
  >({});

  const [courseProgress, setCourseProgress] = useState<Record<string, number>>(
    {}
  );

  // CARGAR USUARIO
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // CARGAR ESQUEMA
  useEffect(() => {
    if (!uuid) return;

    const loadSchema = async () => {
      try {
        const fullSchema = await schemaService.getFullSchemaByCourse(uuid);
        setSchema(fullSchema);
      } catch (err) {
        console.error("Error cargando esquema completo:", err);
      }
    };

    loadSchema();
  }, [uuid]);

  // CARGAR DETALLES DEL CURSO
  useEffect(() => {
    if (!uuid) return;

    const loadCourse = async () => {
      try {
        const courseData = await courseService.getPublicSummary(uuid);
        setCourse(courseData);
      } catch (err) {
        console.error("Error cargando curso:", err);
      }
    };

    loadCourse();
  }, [uuid]);

  useEffect(() => {
    async function loadProgress() {
      if (!user?.uuid) return;

      try {
        const progresses = await progressService.listByStudent(user.uuid);
        console.log("Progresos del usuario:", progresses);

        // === 1. Mapear para CourseSchemaView ===
        const map: Record<string, { finished: boolean; uuid?: string }> = {};
        progresses.forEach((p) => {
          map[p.entry_uuid] = { finished: p.finished, uuid: p.uuid };
        });
        setProgressMap(map);

        // === 2. Calcular % de progreso por curso ===
        const progressByCourse: Record<
          string,
          { total: number; finished: number }
        > = {};

        progresses.forEach((p) => {
          // ⚠️ Aquí no podemos usar split("-")[0], sino basarnos en schema.entries
          // Este cálculo se haría mejor en la página de cursos, no en el dashboard.
          // Pero lo dejamos simple:
          const courseUuid = p.entry_uuid.split("-")[0];
          if (!progressByCourse[courseUuid]) {
            progressByCourse[courseUuid] = { total: 0, finished: 0 };
          }
          progressByCourse[courseUuid].total++;
          if (p.finished) progressByCourse[courseUuid].finished++;
        });

        const result: Record<string, number> = {};
        Object.entries(progressByCourse).forEach(
          ([courseUuid, { total, finished }]) => {
            result[courseUuid] =
              total > 0 ? Math.round((finished / total) * 100) : 0;
          }
        );

        setCourseProgress(result);
      } catch (err) {
        console.error("Error cargando progresos:", err);
      }
    }

    loadProgress();
  }, [user?.uuid, uuid]);

  useEffect(() => {
    if (!selectedEntry) {
      setProgressUuid(null);
      return;
    }

    const found = progressMap[selectedEntry.uuid!];
    setProgressUuid(found?.uuid || null);
  }, [selectedEntry, progressMap]);

  return (
    <div className={style.dashboard}>
      {/* === SIDEBAR FLOTANTE === */}
      <aside
        className={`${style.sidebar} ${
          sidebarOpen ? style.open : style.closed
        }`}
      >
        {/* Botón para colapsar */}
        <button
          className={style.toggleBtn}
          onClick={() => setSidebarOpen(false)}
        >
          <IoChevronBackOutline />
        </button>

        {/* Título del curso */}
        <div className={style.courseHeader}>
          <h2 className={style.courseTitle}>
            {course?.title || "Cargando..."}
          </h2>
          <span className={style.courseId}>ID: {course?.uuid || uuid}</span>
        </div>

        {/* Esquema */}
        <div className={style.schemaWrapper}>
          <CourseSchemaView
            schema={schema}
            selectedEntry={selectedEntry}
            setSelectedEntry={(entry) => {
              setSelectedEntry(entry);
              setSidebarOpen(false);
            }}
            editable={false}
            user={user}
            progressMap={progressMap}
            setProgressMap={setProgressMap}
          />
        </div>

        {/* Perfil usuario */}
        <div className={style.userProfile}>
          {user ? (
            <>
              <img
                src={
                  user.avatar_path
                    ? user.avatar_path
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || "Usuario"
                      )}&background=random`
                }
                alt={user.name}
                className={style.avatar}
              />
              <span className={style.userName}>{user.name}</span>
            </>
          ) : (
            <span>Cargando...</span>
          )}
        </div>
      </aside>

      {/* === BOTÓN FLOTANTE PARA REABRIR SIDEBAR === */}
      {!sidebarOpen && (
        <button
          className={style.showSidebarBtn}
          onClick={() => setSidebarOpen(true)}
        >
          <IoChevronForwardOutline />
        </button>
      )}

      {/* === CONTENIDO CENTRAL === */}
      <main className={style.content}>
        {selectedEntry ? (
          <div className={style.entryContent}>
            <h2 className={style.entryTitle}>{selectedEntry.name}</h2>
            <div className={style.entryBody}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedEntry.body || "_Sin contenido_"}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className={style.emptyState}>
            <p>Selecciona un tema del esquema para empezar</p>
          </div>
        )}
      </main>

      {/* === MENÚ DERECHO === */}
      <nav className={style.rightMenu}>
        <NavLink to="/dashboard" className={style.menuBtn} title="Inicio">
          <IoHomeOutline />
        </NavLink>
        <NavLink to="/courses" className={style.menuBtn} title="Cursos">
          <IoBookOutline />
        </NavLink>
        <NavLink to="/settings" className={style.menuBtn} title="Configuración">
          <IoSettingsOutline />
        </NavLink>
      </nav>
      {/* AI CHAT widget */}
      {progressUuid && <AIChatWidget progressUuid={progressUuid} />}
    </div>
  );
}
