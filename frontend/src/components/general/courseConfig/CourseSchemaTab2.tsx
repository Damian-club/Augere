import { useEffect, useState } from "react";
import { schemaService } from "../../../services";
import type { Course } from "../../../schemas/course";
import {
  IoClipboardOutline,
  IoDocumentTextOutline,
  IoCodeSlashOutline,
  IoArrowDownCircleOutline,
  IoSparklesOutline,
  IoSaveOutline,
} from "react-icons/io5";
import {
  type Category,
  type Entry,
  type FullSchema,
} from "../../../schemas/schema";
import style from "./CourseSchemaTab.module.css";

type Props = {
  course: Course;
};

export default function CourseSchemaTab2({ course }: Props) {
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    const loadSchema = async () => {
      try {
        // Obtener esquema por el course_id
        const fullSchema = await schemaService.getFullSchemaByCourse(
          course.uuid
        );
        setSchema(fullSchema);
      } catch (err) {
        console.warn("No se encontro esquema, creando uno nuevo...");
        try {
          // Crear esquema
          const newSchema = await schemaService.createSchema(course.uuid);
          const fullSchema = await schemaService.getFullSchemaByCourse(
            course.uuid
          );
          setSchema(fullSchema);
        } catch (err2) {
          console.error("Error creando el esquema: ", err2);
        }
      } finally {
        setLoading(false);
      }
    };
    loadSchema();
  }, [course.uuid]);

  // Manejar entry seleccionado
  const handleSelectEntry = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  const handleGenerateSchema = () => {
    console.log("Generando esquema con prompt:", aiPrompt);

    const mockSchema: FullSchema = {
      course_uuid: course.uuid,
      uuid: "schema-uuid-" + Date.now(),
      category_list: [
        {
          name: "Introducción a Algoritmos",
          position: 0,
          schema_uuid: "schema-uuid-123",
          uuid: "cat-intro",
          entry_list: [
            {
              name: "¿Qué es un algoritmo?",
              body: "Un algoritmo es un conjunto finito de instrucciones bien definidas que resuelven un problema específico.",
              context:
                "Introducción básica para principiantes, usar ejemplos cotidianos como recetas de cocina",
              entry_type: "topic",
              position: 0,
              category_uuid: "cat-intro",
              uuid: "entry-intro-1",
            },
            {
              name: "Notación Big O",
              body: "La notación Big O describe el comportamiento asintótico de un algoritmo en el peor de los casos.",
              context:
                "Explicar con gráficas y ejemplos prácticos de O(1), O(n), O(log n), O(n²)",
              entry_type: "topic",
              position: 1,
              category_uuid: "cat-intro",
              uuid: "entry-intro-2",
            },
            {
              name: "Tarea: Análisis de Complejidad",
              body: "Analiza la complejidad temporal de 5 algoritmos proporcionados y justifica tu respuesta.",
              context: "Ejercicios prácticos de nivel básico-intermedio",
              entry_type: "assignment",
              position: 2,
              category_uuid: "cat-intro",
              uuid: "entry-intro-3",
            },
          ],
        },
        {
          name: "Estructuras de Datos Lineales",
          position: 1,
          schema_uuid: "schema-uuid-123",
          uuid: "cat-linear",
          entry_list: [
            {
              name: "Arrays y Listas",
              body: "Arrays son estructuras de tamaño fijo, mientras que las listas dinámicas pueden crecer según necesidad.",
              context:
                "Comparar arrays vs listas enlazadas, ventajas y desventajas",
              entry_type: "topic",
              position: 0,
              category_uuid: "cat-linear",
              uuid: "entry-linear-1",
            },
            {
              name: "Pilas (Stacks)",
              body: "Estructura LIFO (Last In First Out) utilizada en llamadas recursivas y deshacer/rehacer.",
              context:
                "Ejemplos con navegador web (historial), llamadas de funciones",
              entry_type: "topic",
              position: 1,
              category_uuid: "cat-linear",
              uuid: "entry-linear-2",
            },
            {
              name: "Colas (Queues)",
              body: "Estructura FIFO (First In First Out) utilizada en sistemas de procesamiento y BFS.",
              context:
                "Ejemplos con impresoras, colas de mensajes, algoritmos de búsqueda",
              entry_type: "topic",
              position: 2,
              category_uuid: "cat-linear",
              uuid: "entry-linear-3",
            },
          ],
        },
        {
          name: "Árboles y Grafos",
          position: 2,
          schema_uuid: "schema-uuid-123",
          uuid: "cat-trees",
          entry_list: [
            {
              name: "Árboles Binarios",
              body: "Estructura jerárquica donde cada nodo tiene como máximo dos hijos.",
              context:
                "Explicar recorridos: inorden, preorden, postorden con ejemplos visuales",
              entry_type: "topic",
              position: 0,
              category_uuid: "cat-trees",
              uuid: "entry-trees-1",
            },
            {
              name: "Árboles Binarios de Búsqueda (BST)",
              body: "Árbol binario donde el hijo izquierdo es menor y el derecho es mayor que el nodo padre.",
              context:
                "Operaciones CRUD con complejidad O(log n) en el mejor caso",
              entry_type: "topic",
              position: 1,
              category_uuid: "cat-trees",
              uuid: "entry-trees-2",
            },
            {
              name: "Grafos: Representación y Recorridos",
              body: "Grafos se pueden representar con matrices de adyacencia o listas de adyacencia.",
              context:
                "Explicar DFS y BFS con ejemplos de redes sociales y mapas",
              entry_type: "topic",
              position: 2,
              category_uuid: "cat-trees",
              uuid: "entry-trees-3",
            },
            {
              name: "Proyecto: Implementar un BST",
              body: "Implementa un árbol binario de búsqueda con operaciones de insertar, buscar y eliminar.",
              context: "Proyecto práctico con tests incluidos",
              entry_type: "assignment",
              position: 3,
              category_uuid: "cat-trees",
              uuid: "entry-trees-4",
            },
          ],
        },
      ],
    };

    // Cargar el esquema mock
    setSchema(mockSchema);
    // TODO: En producción, llamar al servicio real: schemaService.generateSchema(course.uuid, aiPrompt)
  };

  // Guardar cuerpo
  const handleSaveBody = () => {
    if (!selectedEntry) return;
    console.log("Guardando cuerpo para:", selectedEntry.name);
    // TODO: Llamar al servicio para guardar
  };

  // Generar contexto con IA
  const handleGenerateContext = () => {
    if (!selectedEntry) return;
    console.log("Generando contexto IA para:", selectedEntry.name);
    // TODO: Llamar al servicio para generar contexto
  };

  // Obtener icono del entry
  const getIcon = (entryType: string) => {
    switch (entryType) {
      case "assignment":
        return <IoClipboardOutline className={style.icon} />;
      case "topic":
        return <IoDocumentTextOutline className={style.icon} />;
      default:
        return <IoCodeSlashOutline className={style.icon} />;
    }
  };

  if (loading) return <p>Cargando esquema...</p>;

  return (
    <div className={style.schemaContainer}>
      <div className={style.aiPromptSection}>
        <div className={style.promptHeader}>
          <IoSparklesOutline className={style.sparkleIcon} />
          <h2>Generar Esquema con IA</h2>
        </div>
        <textarea
          className={style.aiPromptInput}
          placeholder="Describe el esquema que deseas generar. Ejemplo: 'Curso de Python desde cero con 3 módulos: fundamentos, POO y web development'"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={3}
        />
        <button className={style.generateBtn} onClick={handleGenerateSchema}>
          <IoSparklesOutline />
          Generar Esquema
        </button>
      </div>

      {schema?.category_list.length === 0 ? (
        <div className={style.noSchemaState}>
          <IoDocumentTextOutline className={style.noSchemaIcon} />
          <h3>No has creado un esquema todavía</h3>
          <p>
            Usa el campo de arriba para generar un esquema con IA o crea uno
            manualmente desde el backend.
          </p>
        </div>
      ) : (
        <div className={style.mainContent}>
          {/* === PANEL DE ESQUEMA === */}
          <div className={style.schemaPanel}>
            <h3 className={style.panelTitle}>Esquema del Curso</h3>
            <div className={style.categoriesList}>
              {schema?.category_list
                .sort((a, b) => a.position - b.position)
                .map((category) => (
                  <div key={category.uuid} className={style.category}>
                    <div className={style.categoryHeader}>
                      <IoArrowDownCircleOutline
                        className={style.categoryIcon}
                      />
                      <h4>{category.name}</h4>
                    </div>

                    <div className={style.entriesList}>
                      {category.entry_list
                        .sort((a, b) => a.position - b.position)
                        .map((entry) => (
                          <div
                            key={entry.uuid}
                            className={`${style.entryItem} ${
                              selectedEntry?.uuid === entry.uuid
                                ? style.selected
                                : ""
                            }`}
                            onClick={() => handleSelectEntry(entry)}
                          >
                            {getIcon(entry.entry_type)}
                            <span className={style.entryName}>
                              {entry.name}
                            </span>
                            <span className={style.entryBadge}>
                              {entry.entry_type}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* === PANEL EDITOR === */}
          <div className={style.editorPanel}>
            <h3 className={style.panelTitle}>Editor de Contenido</h3>
            {!selectedEntry ? (
              <div className={style.placeholderState}>
                <IoDocumentTextOutline className={style.placeholderIcon} />
                <p>Selecciona un tema o tarea del esquema para editarlo</p>
              </div>
            ) : (
              <div className={style.editorContent}>
                <div className={style.selectedHeader}>
                  <h4>{selectedEntry.name}</h4>
                  <span
                    className={`${style.typeBadge} ${
                      selectedEntry.entry_type === "topic"
                        ? style.topic
                        : style.assignment
                    }`}
                  >
                    {selectedEntry.entry_type === "topic" ? "Tema" : "Tarea"}
                  </span>
                </div>

                {/* Campo CUERPO */}
                <div className={style.editorField}>
                  <label className={style.fieldLabel}>
                    <IoDocumentTextOutline />
                    Cuerpo del contenido
                  </label>
                  <textarea
                    className={style.fieldTextarea}
                    placeholder="Escribe aquí el contenido principal de este tema o tarea..."
                    value={selectedEntry.body || ""}
                    onChange={(e) =>
                      setSelectedEntry({
                        ...selectedEntry,
                        body: e.target.value,
                      })
                    }
                    rows={6}
                  />
                  <button className={style.saveBtn} onClick={handleSaveBody}>
                    <IoSaveOutline />
                    Guardar Cuerpo
                  </button>
                </div>

                {/* Campo CONTEXTO */}
                <div className={style.editorField}>
                  <label className={style.fieldLabel}>
                    <IoSparklesOutline />
                    Contexto para IA
                    <span className={style.fieldHint}>
                      Proporciona contexto adicional para generar contenido con
                      IA
                    </span>
                  </label>
                  <textarea
                    className={style.fieldTextarea}
                    placeholder="Ej: 'Explicar con ejemplos prácticos en Python, nivel intermedio, enfocado en buenas prácticas'"
                    value={selectedEntry.context || ""}
                    onChange={(e) =>
                      setSelectedEntry({
                        ...selectedEntry,
                        context: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  <button
                    className={style.generateContextBtn}
                    onClick={handleGenerateContext}
                  >
                    <IoSparklesOutline />
                    Generar con IA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
