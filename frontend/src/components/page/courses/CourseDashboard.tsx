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
import { authService, courseService } from "../../../services";
import type { Course } from "../../../schemas/course";
import type { User } from "../../../schemas/auth";

export default function CourseDashboard() {
  const { uuid } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const mockSchema: FullSchema = {
    course_uuid: "course-uuid-demo",
    uuid: "schema-uuid-demo",
    category_list: [
      {
        name: "Introducción a Algoritmos",
        position: 0,
        schema_uuid: "schema-uuid-demo",
        uuid: "cat-intro",
        entry_list: [
          {
            name: "¿Qué es un algoritmo?",
            body: "Contenido introductorio...",
            context: "Contexto inicial...",
            entry_type: "topic",
            position: 0,
            category_uuid: "cat-intro",
            uuid: "entry-intro-1",
          },
          {
            name: "Notación Big O",
            body: "Explicación de complejidad temporal.",
            context: "Comparación entre algoritmos...",
            entry_type: "topic",
            position: 1,
            category_uuid: "cat-intro",
            uuid: "entry-intro-2",
          },
          {
            name: "Tarea: Análisis de Complejidad",
            body: "Resuelve ejercicios sobre Big O.",
            context: "Aplicación práctica de complejidad.",
            entry_type: "assignment",
            position: 2,
            category_uuid: "cat-intro",
            uuid: "entry-intro-3",
          },
        ],
      },
      {
        name: "Estructuras de Datos",
        position: 1,
        schema_uuid: "schema-uuid-demo",
        uuid: "cat-ds",
        entry_list: [
          {
            name: "Listas y Pilas",
            body: "Contenido sobre estructuras lineales.",
            context: "Uso en algoritmos clásicos.",
            entry_type: "topic",
            position: 0,
            category_uuid: "cat-ds",
            uuid: "entry-ds-1",
          },
        ],
      },
    ],
  };

  const [schema] = useState<FullSchema>(mockSchema);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

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
    if (!uuid) return;
    courseService
      .getCourse(uuid)
      .then((data) => setCourse(data))
      .catch((err) => console.error("Error al cargar el curso:", err));
  }, [uuid]);

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
            <p className={style.entryBody}>{selectedEntry.body}</p>
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
      <AIChatWidget />
    </div>
  );
}
