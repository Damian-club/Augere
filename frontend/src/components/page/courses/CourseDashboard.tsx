import { useState } from "react";
import { useParams } from "react-router-dom";
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

export default function CourseDashboard() {
  const { uuid } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <h2 className={style.courseTitle}>Diseño de Algoritmos</h2>
          <span className={style.courseId}>ID: {uuid}</span>
        </div>

        {/* Esquema */}
        <div className={style.schemaWrapper}>
          <CourseSchemaView
            schema={schema}
            selectedEntry={selectedEntry}
            setSelectedEntry={setSelectedEntry}
            editable={false}
          />
        </div>

        {/* Perfil usuario */}
        <div className={style.userProfile}>
          <img
            src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=student"
            alt="Avatar"
            className={style.avatar}
          />
          <span className={style.userName}>Juan Pérez</span>
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
        <button className={style.menuBtn} title="Inicio">
          <IoHomeOutline />
        </button>
        <button className={style.menuBtn} title="Cursos">
          <IoBookOutline />
        </button>
        <button className={style.menuBtn} title="Configuración">
          <IoSettingsOutline />
        </button>
      </nav>
    </div>
  );
}
