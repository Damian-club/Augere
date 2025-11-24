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

function sortSchema(schema: FullSchema): FullSchema {
  return {
    ...schema,
    category_list: [...schema.category_list]
      .sort((a, b) => a.position - b.position)
      .map((cat) => ({
        ...cat,
        entry_list: [...cat.entry_list].sort((a, b) => a.position - b.position),
      })),
  };
}

export default function CourseDashboard() {
  const { uuid } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const isTutor = user?.uuid === course?.tutor?.uuid;
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [progressUuid, setProgressUuid] = useState<string | null>(null);
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [progressMap, setProgressMap] = useState<
    Record<string, { finished: boolean; uuid?: string }>
  >({});

  const [studentRecordUuid, setStudentRecordUuid] = useState<string | null>(
    null
  );

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
      if (!user) return;
      if (!course) return;

      if (user.uuid === course.tutor?.uuid) {
        console.log("Eres el tutor, no se carga studentRecord");
        return;
      }

      try {
        const response = await fetch(
          `${environment.api}/student/by-user-course/${user.uuid}/${course.uuid}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStudentRecordUuid(data.uuid);
        } else {
          console.log("No hay registro de estudiante");
        }
      } catch (error) {
        console.error("Error obteniendo Student record:", error);
      }
    };

    fetchStudentRecord();
  }, [user, course]);

  useEffect(() => {
    if (!uuid) return;

    const loadSchema = async () => {
      try {
        const fullSchema = await schemaService.getFullSchemaByCourse(uuid);
        const ordered = sortSchema(fullSchema);
        setSchema(ordered);
      } catch (err) {
        console.error("Error cargando esquema completo:", err);
      }
    };

    loadSchema();
  }, [uuid]);

  useEffect(() => {
    if (isTutor) return;
    if (!studentRecordUuid) return;

    async function loadProgress() {
      try {
        console.log("Cargando progresos para", studentRecordUuid);

        const progresses = await progressService.listByStudent(
          studentRecordUuid!
        );

        const map: Record<string, { finished: boolean; uuid?: string }> = {};

        for (const p of progresses) {
          map[p.entry_uuid] = {
            finished: p.finished,
            uuid: p.uuid,
          };
        }

        console.log("ProgressMap final:", map);
        setProgressMap(map);
      } catch (err) {
        console.error("Error cargando progresos", err);
      }
    }

    loadProgress();
  }, [studentRecordUuid]);

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
    if (!selectedEntry) {
      setProgressUuid(null);
      return;
    }

    const found = progressMap[selectedEntry.uuid!];
    setProgressUuid(found?.uuid || null);
  }, [selectedEntry, progressMap]);

  useEffect(() => {
    if (isTutor) return;
    async function handleEntrySelection() {
      if (!selectedEntry || !studentRecordUuid) {
        setProgressUuid(null);
        return;
      }

      console.log(
        `📝 Entry seleccionado: ${selectedEntry.name} (${selectedEntry.uuid})`
      );

      const existingProgress = progressMap[selectedEntry.uuid!];

      if (existingProgress?.uuid) {
        console.log(`✅ Progress UUID encontrado: ${existingProgress.uuid}`);
        setProgressUuid(existingProgress.uuid);
      } else {
        console.log(`⚠️ No existe progreso, creando uno nuevo...`);

        try {
          const newProgress = await progressService.create({
            student_uuid: studentRecordUuid,
            entry_uuid: selectedEntry.uuid!,
            finished: false,
          });

          console.log(`✅ Nuevo progreso creado: ${newProgress.uuid}`);

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

  const flatEntries = schema
    ? schema.category_list.flatMap((c) =>
        c.entry_list
          .map((e) => ({ ...e, category_uuid: c.uuid }))
          .sort((a, b) => a.position - b.position)
      )
    : [];

  const currentIndex = selectedEntry
    ? flatEntries.findIndex((e) => e.uuid === selectedEntry.uuid)
    : -1;

  const prevEntry = currentIndex > 0 ? flatEntries[currentIndex - 1] : null;
  const nextEntry =
    currentIndex >= 0 && currentIndex < flatEntries.length - 1
      ? flatEntries[currentIndex + 1]
      : null;

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
            isTutor={isTutor}
            setSelectedEntry={(entry) => {
              setSelectedEntry(entry);
              setSidebarOpen(false);
            }}
            editable={false}
            user={user}
            studentRecordUuid={isTutor ? null : studentRecordUuid}
            progressMap={isTutor ? {} : progressMap}
            setProgressMap={isTutor ? () => {} : setProgressMap}
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
            {/* <h2 className={style.entryTitle}>{selectedEntry.name}</h2> */}

            <div className={style.entryBody}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {selectedEntry.body || "_Sin contenido_"}
              </ReactMarkdown>
            </div>
            {!isTutor &&
              selectedEntry.entry_type === "assignment" &&
              progressUuid && (
                <AssignmentWidget
                  progressUuid={progressUuid}
                  instructions={
                    selectedEntry.context ||
                    "Responde basándote en el contenido anterior"
                  }
                />
              )}
            <div className={style.buttonsContainer}>
              {prevEntry && (
                <button
                  className={style.navBtn}
                  onClick={() => setSelectedEntry(prevEntry as Entry)}
                >
                  Anterior
                </button>
              )}

              {nextEntry && (
                <button
                  className={style.navBtn}
                  onClick={async () => {
                    if (!selectedEntry) return;

                    if (
                      selectedEntry.entry_type === "topic" &&
                      studentRecordUuid
                    ) {
                      const existing = progressMap[selectedEntry.uuid!];

                      try {
                        if (existing?.uuid) {
                          await progressService.update(existing.uuid, {
                            finished: true,
                          });
                          setProgressMap((prev) => ({
                            ...prev,
                            [selectedEntry.uuid!]: {
                              ...prev[selectedEntry.uuid!],
                              finished: true,
                            },
                          }));
                        } else {
                          const created = await progressService.create({
                            student_uuid: studentRecordUuid,
                            entry_uuid: selectedEntry.uuid!,
                            finished: true,
                          });
                          setProgressMap((prev) => ({
                            ...prev,
                            [selectedEntry.uuid!]: {
                              finished: true,
                              uuid: created.uuid,
                            },
                          }));
                        }
                      } catch (err) {
                        console.error(
                          "Error marcando lectura como completada:",
                          err
                        );
                      }
                    }

                    setSelectedEntry(nextEntry as Entry);
                  }}
                >
                  Siguiente
                </button>
              )}
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
      {!isTutor && progressUuid && selectedEntry && (
        <AIChatWidget progressUuid={progressUuid} />
      )}
    </div>
  );
}
