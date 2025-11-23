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
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { environment } from "../../../config/environment";
import AssignmentWidget from "../../general/AssigmentWidget/AssigmentWidget";

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
  const [studentRecordUuid, setStudentRecordUuid] = useState<string | null>(
    null
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

  useEffect(() => {
    const fetchStudentRecord = async () => {
      if (!user?.uuid || !uuid) return;

      try {
        const response = await fetch(
          `${environment.api}/student/by-user-course/${user.uuid}/${uuid}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStudentRecordUuid(data.uuid);
          console.log("Student record UUID obtenido:", data.uuid);
        } else {
          console.log(
            "ℹNo hay registro de estudiante (probablemente eres el tutor)"
          );
        }
      } catch (error) {
        console.error("Error obteniendo Student record:", error);
      }
    };

    fetchStudentRecord();
  }, [user?.uuid, uuid]);

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
    async function initialize() {
      if (!user?.uuid || !uuid) {
        console.log("Faltan datos:", {
          userUuid: user?.uuid,
          courseUuid: uuid,
        });
        return;
      }

      try {
        console.log(
          `🔍 Obteniendo Student Record: user=${user.uuid}, course=${uuid}`
        );

        const response = await fetch(
          `${environment.api}/student/by-user-course/${user.uuid}/${uuid}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.log("ℹ️ No hay Student Record (probablemente eres tutor)");
          return;
        }

        const studentRecord = await response.json();
        const recordUuid = studentRecord.uuid;

        console.log("Student Record UUID obtenido:", recordUuid);
        setStudentRecordUuid(recordUuid);

        // 2. CARGAR PROGRESOS CON STUDENT RECORD UUID
        console.log("Cargando progresos con studentRecordUuid:", recordUuid);
        const progresses = await progressService.listByStudent(recordUuid);

        console.log("Progresos obtenidos:", progresses);
        console.log(`Total: ${progresses.length} progresos`);

        // 3. CREAR PROGRESS MAP
        const map: Record<string, { finished: boolean; uuid?: string }> = {};

        progresses.forEach((p) => {
          // El último del array sobrescribe (asumimos que es el más reciente)
          map[p.entry_uuid] = { finished: p.finished, uuid: p.uuid };
        });

        Object.entries(map).forEach(([entryUuid, data]) => {
          console.log(`  📌 ${entryUuid}: ${data.finished ? "✅" : "⬜"}`);
        });

        console.log("Progress Map completo:", map);
        console.log(`Total único: ${Object.keys(map).length} entries`);
        setProgressMap(map);
      } catch (error) {
        console.error("Error en inicialización:", error);
      }
    }

    initialize();
  }, [user?.uuid, uuid]);

  useEffect(() => {
    if (!selectedEntry) {
      setProgressUuid(null);
      return;
    }

    const found = progressMap[selectedEntry.uuid!];
    setProgressUuid(found?.uuid || null);
  }, [selectedEntry, progressMap]);

  useEffect(() => {
    async function handleEntrySelection() {
      if (!selectedEntry || !studentRecordUuid) {
        setProgressUuid(null);
        return;
      }

      console.log(
        `📝 Entry seleccionado: ${selectedEntry.name} (${selectedEntry.uuid})`
      );

      // Buscar si ya existe un progreso para este entry
      const existingProgress = progressMap[selectedEntry.uuid!];

      if (existingProgress?.uuid) {
        console.log(`✅ Progress UUID encontrado: ${existingProgress.uuid}`);
        setProgressUuid(existingProgress.uuid);
      } else {
        // Si no existe, crear un nuevo progreso
        console.log(`⚠️ No existe progreso, creando uno nuevo...`);

        try {
          const newProgress = await progressService.create({
            student_uuid: studentRecordUuid,
            entry_uuid: selectedEntry.uuid!,
            finished: false,
          });

          console.log(`✅ Nuevo progreso creado: ${newProgress.uuid}`);

          // Actualizar el progressMap
          setProgressMap((prev) => ({
            ...prev,
            [selectedEntry.uuid!]: { finished: false, uuid: newProgress.uuid },
          }));

          setProgressUuid(newProgress.uuid);
        } catch (err) {
          console.error("❌ Error creando progreso:", err);
          setProgressUuid(null);
        }
      }
    }

    handleEntrySelection();
  }, [selectedEntry, studentRecordUuid, progressMap]);

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
            studentRecordUuid={studentRecordUuid}
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
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {selectedEntry.body || "_Sin contenido_"}
              </ReactMarkdown>
            </div>
            {selectedEntry.entry_type === "assignment" && progressUuid && (
              <AssignmentWidget
                progressUuid={progressUuid}
                instructions={
                  selectedEntry.context ||
                  "Responde basándote en el contenido anterior"
                }
              />
            )}
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
      {progressUuid && selectedEntry && (
        <AIChatWidget progressUuid={progressUuid} />
      )}
    </div>
  );
}
